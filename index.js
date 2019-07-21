'use strict'

const conf = require('./lib/config')

const Telegraf = require('telegraf')
const LocalSession = require('telegraf-session-local') // https://github.com/typicode/lowdb
const schedule = require('node-schedule') // https://github.com/node-schedule/node-schedule

const LogMW = require('./lib/log')
const SessionMW = require('./lib/session')
const State = require('./lib/state')
const i18nMW = require('./lib/i18n')
const Notifier = require('./lib/notifier')

const logger = require('loglevel') // https://github.com/pimterry/loglevel
    .getLogger(conf.appName)
logger.setLevel(conf.logLevel)

logger.debug(conf)

const bot = new Telegraf(conf.tgToken)
const session = new LocalSession({database: 'db/session.json'})
const logMW = new LogMW(logger)
const sessionMW = new SessionMW()
const state = new State(logger)
const notifier = new Notifier(logger, bot.telegram, session, i18nMW)

bot.use(logMW.middleware())
bot.catch(logMW.errorHandler())
bot.use(session.middleware())
bot.use(i18nMW.middleware())
bot.use(sessionMW.middleware())
bot.start(notifier.start())
bot.on('text', notifier.anyText())
bot.on('audio', notifier.anyMessage())
bot.on('document', notifier.anyMessage())
bot.on('photo', notifier.anyMessage())
bot.on('sticker', notifier.anyMessage())
bot.on('video', notifier.anyMessage())
bot.on('voice', notifier.anyMessage())
bot.on('contact', notifier.anyMessage())
bot.on('location', notifier.anyMessage())
bot.on('venue', notifier.anyMessage())

state.check()
schedule.scheduleJob(conf.schedule, async () => {
    const changes = await state.check()
    logger.info('GOT changes %d', changes.length)
    await notifier.notify(changes)
})

bot.startPolling()
