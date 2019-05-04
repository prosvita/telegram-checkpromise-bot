'use strict'

const MSECONDS = 1000

class SessionMW {
    middleware () {
        return (ctx, next) => next().then(() => {
            if (!('counter' in ctx.session)) {
                ctx.session.counter = 0
                ctx.session.time_start = Math.floor(Date.now() / MSECONDS) /* eslint camelcase: "off" */
            }
            ctx.session.counter++
            ctx.session.disable = false
            ctx.session.time_last = Math.floor(Date.now() / MSECONDS) /* eslint camelcase: "off" */
            if ('message' in ctx && ctx.message && 'from' in ctx.message && ctx.message.from) {
                const from = [
                    'first_name',
                    'last_name',
                    'username'
                ]
                from.forEach((item) => {
                    if (item in ctx.message.from) {
                        ctx.session[item] = ctx.message.from[item]
                    }
                })
            }
        })
    }
}

module.exports = SessionMW
