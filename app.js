process.env = require('./.env.js');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const vhost = require('vhost');

const rootDomainRoutes = require('./routes/rootdomain_route.js');
const subDomainRoutes = require('./routes/subdomain_route.js');

const main = async () => {
    const app = express();
    const port = process.env.PORT;

    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB ' + db.connection.name);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(vhost(process.env.DOMAIN, rootDomainRoutes))
        .use(vhost('www.' + process.env.DOMAIN, rootDomainRoutes))
        .use(vhost('*.' + process.env.DOMAIN, subDomainRoutes));

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