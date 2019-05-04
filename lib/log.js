'use strict'

class LogMW {
    constructor (logger) {
        this.logger = logger
    }

    middleware () {
        return (ctx, next) => {
            const start = new Date()
            return next(ctx).then(() => {
                const ms = new Date() - start
                const props = [
                    'message',
                    'editedMessage',
                    'inlineQuery',
                    'chosenInlineResult',
                    'callbackQuery',
                    'shippingQuery',
                    'preCheckoutQuery',
                    'channelPost',
                    'editedChannelPost'
                ]
                props.forEach((item) => {
                    if (ctx[item]) {
                        this.logger.info('RECEIVE %s %s — %s', item, JSON.stringify(ctx[item]), ms)
                    }
                })
            })
        }
    }

    errorHandler () {
        return (error) => {
            this.logger.error('ERROR %s', error)
        }
    }
}

module.exports = LogMW
