'use strict'

const Extra = require('telegraf/extra')

class Notifier {
    constructor (logger, telegram, session, i18n) {
        this.logger = logger
        this.telegram = telegram
        this.session = session
        this.i18n = i18n
    }

    start () {
        return (ctx) => {
            ctx.reply(ctx.i18n.t('/start message'), Extra.markdown())
        }
    }

    async notify (changes) {
        if (!changes.length) {
            return
        }

        const chats = this.session.DB
            .get('sessions')
            .filter((item) => !item.data.disable)
            .value()
            .map((item) => {return {id: item.id, lang: item.__language_code}})

        for (let chat of chats) {
            const messages = []

            for (let change of changes) {
                if (change.measure === 'completed') {
                    if (change.newValue) {
                        messages.push(`${this.i18n.t(chat.lang, 'notify/completed')}\n${change.description}`)
                    }
                } else {
                    messages.push(`${
                            this.i18n.t(chat.lang,
                                (change.oldValue < change.newValue) === change.invertArrow ? 'notify/improvements' : 'notify/treason'
                            )
                        }\n${change.description} ${
                            change.oldValue < change.newValue ? '↑' : '↓'
                        } ${change.newValue} ${change.measure}`)
                }
            }

            try {
                await this.telegram.sendMessage(chat.id, messages.join('\n'), Extra.markdown())
                this.logger.info('MADE sendMessage %s', chat.id)
            } catch (error) {
                if (error.description === 'Forbidden: bot was blocked by the user') {
                    this.logger.info('DISABLE chat %s', chat.id)
                    this.disableChat(chat.id)
                } else {
                    this.logger.error('ERROR sendMessage %s', error)
                }
            }
        }
    }

    disableChat (chatId) {
        this.session.DB
            .get('sessions')
            .find((item) => item.id === chatId)
            .set('data.disable', true)
            .write()
    }
}

module.exports = Notifier
