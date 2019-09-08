const functions = require('firebase-functions')
const express = require('express')
const requestIp = require('request-ip')
const ipRangeCheck = require('ip-range-check')
const is = require('is_js')
const basicAuth = require('basic-auth-connect')

const { Nuxt } = require('nuxt')
let config = require('./nuxt.config.js')

const ALLOWIPS = [
  '127.0.0.1', // local
]
const USERNAME = 'system'
const PASSWORD = 'hogehoge'

const app = express()

const basic = basicAuth(function(user, password) {
  return user === USERNAME && password === PASSWORD;
})

// IP Auth
app.all('/*', (req, res, next) => {
  const clientIp = is.ip(req.headers['fastly-client-ip'])
    ? req.headers['fastly-client-ip']
    : requestIp.getClientIp(req)

  ipRangeCheck(clientIp, ALLOWIPS)
    ? next()
    : basic(req, res, next)
})

// Instantiate nuxt.js
const nuxt = new Nuxt(config)
app.use(nuxt.render)

module.exports.app = functions.https.onRequest(app);
