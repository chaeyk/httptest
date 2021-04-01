'use strict';

const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger');
const Joi = require('joi');
const sleep = require('await-sleep')
const got = require('got')

const os = require('os')

const hostname = os.hostname()
const port = 8080

const init = async () => {
    const server = Hapi.server({
        port: port,
    })

    const swaggerOptions = {
        info: {
            title: 'Test API Documentation',
            version: '1.0'
        },
        documentationPath: '/swagger'
    }

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ])

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return `${hostname} - Hello world`
        }
    })

    server.route({
        method: 'GET',
        path: '/ping',
        handler: (request, h) => {
            return `${hostname} - Hello world`
        }
    })

    var status = 200;
    server.route({
        method: 'GET',
        path: '/status',
        handler: (request, h) => {
            return h.response(`${hostname} - ${status}`).code(status)
        },
        options: {
            tags: ['api']
        }
    })
    server.route({
        method: 'PUT',
        path: '/status/{status}',
        handler: (request, h) => {
            status = request.params.status
            return h.response(`${hostname} - set ${status}`).code(status)
        },
        options: {
            tags: ['api'],
            validate: {
                params: Joi.object({
                    status: Joi.number().default(503).required().description('new http status code')
                })
            }
        }
    })

    server.route({
        method: 'GET',
        path: '/delay/{delay}',
        handler: async (request, h) => {
            var delay = request.params.delay
            await sleep(delay * 1000)
            return `${hostname} - delayed ${delay} seconds`
        },
        options: {
            tags: ['api'],
            validate: {
                params: Joi.object({
                    delay: Joi.number().required().default(1).description('delay (seconds)')
                })
            }
        }
    })

    server.route({
        method: 'GET',
        path: '/call',
        handler: async (request, h) => {
            const url = request.query.url
            const response = await got(url)
            return response.body
        },
        options: {
            tags: ['api'],
            validate: {
                query: Joi.object({
                    url: Joi.string().required().default('https://google.com').description('url')
                })
            }
        }
    })

    await server.start()
    console.log(`Server running on ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
})

process.on('SIGINT', function() { process.exit(); })
process.on('SIGTERM', function() { process.exit(); })

init()
