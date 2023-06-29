process.env = require('./.env.js');
const express = require('express');
const { exec } = require('child_process')
const bodyParser = require('body-parser')

// const vhost = require('vhost');
// const rootDomainRoutes = require('./routes/rootdomain_route');
function run(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(stderr);
        resolve(stdout);
      })
    })
  }

const configNginx = async (name, port) => {
    const cmds = [
        `cp ./configs/subdomain.conf ./configs/${name}.conf`,
        `sed -i s/subdomain/${name}/g ./configs/${name}.conf`,
        `sed -i s/9000/${port}/g ./configs/${name}.conf`,
        `sudo mv ./configs/${name}.conf /etc/nginx/sites-available/${name}.conf`,
        `sudo ln -s /etc/nginx/sites-available/${name}.conf /etc/nginx/sites-enabled/`,
        `sudo nginx -t`,
        `sudo service nginx reload`,
    ];
    for (let index = 0; index < cmds.length; index++) {
        const cmd = cmds[index];
        console.log('Running command: ' + cmd);
        try {
            await run(cmd);
            if (index === cmds.length - 1) {
                console.log(`Create nginx config for \n subdomain: ${name} \t port: ${port} \t success.`);
            }
        } catch (error) {
            console.log(error);
        }
    }
};

const main = async () => {
    const app = express();
    const port = process.env.PORT;

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    // app.use(vhost(process.env.DOMAIN, rootDomainRoutes))
    //     .use(vhost('www.' + process.env.DOMAIN, rootDomainRoutes));

    app.get('/', (req, res, next) => {
        res.send('GET request to the homepage')
    });
    
    app.post('/', async (req, res) => {
        // res.send('POST request to the homepage');
        const body = JSON.parse(JSON.stringify(req.body));
        const data = {
            name: body.name || null,
            port: parseInt(body.port) || null
        };
        console.log(data, body);
        if (data.name && data.port) {        
            await configNginx(data.name, data.port);
            return res.status(200).json(`Config subdomain successfully. Your link is: https://${data.name}.${process.env.DOMAIN}`);
        } else {
            res.send('Need params to execute (name, port)');
        }
    });

    // error handler
    app.use(function (err, req, res, next) {
        res.status(404).render('error', {
            title: 'Error',
            Domain: process.env.DOMAIN,
        });
    });

    app.listen(port, () => console.log('App now listening on port ' + port));

    return app;
};

main()
    .then(() => console.log('App is running'))
    .catch((err) => console.log({ err }));