'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const inert  = require('inert');
const vision = require('vision');
const path   = require('path');
const Joi    = require('joi');
const Basic  = require('hapi-auth-basic');
const Boom   = require('boom');

server.connection({
    host: '127.0.0.1',
    port: 8000
});

server.register(inert, (err) => {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        config: {
            handler: {
                directory: {
                    path: path.join(__dirname, 'public')
                }
            }
        }
    });
});


server.register(vision, (err) => {
    if (err) {
        throw err;
    }


    server.views({
        engines   : {
            html: require('handlebars')
        },
        path        : 'views',
        layoutPath  : 'views/layout',
        layout      : 'default'
        // helpersPath : 'views/helpers',
        // partialsPath: 'views/partials'
    });

});

const user = {
  admin: {
      username: 'admin',
      password: '12345',
      name: 'Super Admin',
      id: 1
  }
};

const validateAuth = function(req, username, password, cb) {
    let userAuth = user[username];

    if (!userAuth) {
        return cb(null, false);
    }

    return cb(null, true, {
        name: userAuth.name
    });
};

server.register(Basic, (err) => {
    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', {
        validateFunc: validateAuth
    });

    server.route({
        method: 'GET',
        path: '/auth',
        config: {
            auth: 'simple',
            handler: function(req, reply) {
                return reply('hello ' + req.auth.credentials.name);
            }
        }
    });
});

const multiply = function(a, b, next) {
    return next(null, a * b);
};

server.method({
    name   : 'multiply',
    method : multiply,
    options: {}
});

server.route({
    method: 'GET',
    path: '/hello/{name?}',
    handler: function(req, reply) {
        if (req.params.name) {
            return reply({
                message: 'Hello ' + req.params.name
            })
        }

        return reply(Boom.badRequest('You must need a name'));
        // var total = 0;
        //
        // total = server.methods.multiply(2, 2, (err, result) => {
        //     return result;
        // });
        //
        // return reply({
        //     total: total
        // })
    }
});

server.route({
    method: ['GET', 'POST', 'PUT'],
    path: '/',
    handler: function(req, reply) {
        return reply.view('index', {
            name: 'Leonan Luppi'
        });
    }
});

server.route({
    method: 'GET',
    path: '/notfound',
    handler: function(req, reply) {
        return reply(Boom.notFound('Not found'));
    }
});

server.route({
    method: 'GET',
    path: '/badrequest',
    handler: function(req, reply) {
        return reply(Boom.badRequest('Bad request 1'));
    }
})

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('Server is running at: ', server.info.uri);
});