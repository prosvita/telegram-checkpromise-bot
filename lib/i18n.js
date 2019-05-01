'use strict'

const path = require('path')
const conf = require('./config')
const I18n = require('telegraf-i18n') // https://github.com/telegraf/telegraf-i18n

const i18n = new I18n({
    directory: path.resolve(process.cwd(), 'i18n'),
    defaultLanguage: conf.defaultLanguage,
    useSession: true
})

module.exports = i18n
