process.env = require('./.env.js');
const express = require('express');
const { exec } = require('child_process')
const bodyParser = require('body-parser')

// const vhost = require('vhost');
// const rootDomainRoutes = require('./routes/rootdomain_route');
function run(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error)
        if (stderr) return reject(stderr)
        resolve(stdout)
      })
    })
  }

const configNginx = async (name, port) => {
    const cmds = [
        `cp ./configs/subdomain.conf ./configs/${name}.conf`
        `sed -i s/subdomain/${name}/g ./configs/${name}.conf`,
        `sed -i s/9000/${port}/g ./configs/${name}.conf`,
        `cp ./configs/${name}.conf /etc/nginx/sites-available/${name}.conf`,
        `ln -s /etc/nginx/sites-available/${name}.conf /etc/nginx/sites-enabled/`,
        `nginx -t`,
        `sudo service nginx reload`
    ];
    for (const cmd of cmds) {
        console.log('Running command: ' + cmd);
        const log = await run(cmd);
        console.log('Output: '+ log);
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
        console.log(req.headers, req.body);
        const body = JSON.stringify(req.body);
        const data = {
            name: body.name || null,
            port: body.port || null
        };
        if (data.name && data.port) {        
            await configNginx(req.body.name, req.body.port);
            return res.status(200).json();
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