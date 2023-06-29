process.env = require('./.env.js');
const express = require('express');
const vhost = require('vhost');
const rootDomainRoutes = require('./routes/rootdomain_route');

const main = async () => {
    const app = express();
    const port = process.env.PORT;

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(vhost(process.env.DOMAIN, rootDomainRoutes))
        .use(vhost('www.' + process.env.DOMAIN, rootDomainRoutes));

    // app.get('/', (req, res, next) => {
    //     res.send('GET request to the homepage')
    // });
    
    // app.post('/', (req, res) => {
    //     res.send('POST request to the homepage');
    // });

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