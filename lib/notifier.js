'use strict'

const Extra = require('telegraf/extra')

class Notifier {
    constructor (logger, telegram, session, i18n) { /* eslint max-params: "off" */
        this.logger = logger
        this.telegram = telegram
        this.session = session
        this.i18n = i18n
    }

    start () { /* eslint class-methods-use-this: "off" */
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
            .map((item) => ({
                id: item.id,
                lang: item.__language_code /* eslint no-underscore-dangle: "off" */
            }))

        for (const chat of chats) {
            const message = this.makeMessage(changes, chat.lang)
            await this.sendMessage(chat.id, message) /* eslint no-await-in-loop: "off" */
        }
    }

    makeMessage (changes, lang) {
        const messages = []

        for (const change of changes) {
            if (change.news) {
                messages.push(`${change.news}\n`)
            } else if (change.measure === 'completed') {
                if (change.newValue) {
                    messages.push(`${this.i18n.t(lang, 'notify/completed')}\n${change.description}`)
                }
            } else {
                messages.push(`${
                    this.i18n.t(
                        lang,
                        (change.oldValue < change.newValue) === change.invertArrow ? 'notify/improvements' : 'notify/treason'
                    )
                }\n[${change.description}](https://www.checkpromise.info/${change.id}?utm_medium=referral&utm_source=telegram_bot) ${
                    change.oldValue < change.newValue ? '↑' : '↓'
                } ${change.newValue} ${change.quantity} ${change.measure}`)
            }
        }

        return messages.join('\n')
    }

    async sendMessage (chatId, message) {
        try {
            await this.telegram.sendMessage(chatId, message, Extra.markdown())
            this.logger.info('MADE sendMessage %s', chatId)
        } catch (error) {
            if (error.description === 'Forbidden: bot was blocked by the user') {
                this.logger.info('DISABLE chat %s', chatId)
                this.disableChat(chatId)
            } else {
                this.logger.error('ERROR sendMessage %s', error)
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
