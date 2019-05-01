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
                        this.logger.info('%s BOT %s %s — %s', start, item, JSON.stringify(ctx[item]), ms)
                    }
                })
            })
        }
    }

    errorHandler () {
        return (err) => {
            this.logger.error('%s BOT ERROR %s', new Date(), err)
        }
    }
}

module.exports = LogMW
