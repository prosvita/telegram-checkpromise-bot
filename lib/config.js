'use strict'

const path = require('path')
const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const conf = require(path.resolve(process.cwd(), `configs/${nodeEnv}/node.js`))

module.exports = conf
