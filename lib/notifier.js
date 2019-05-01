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
        const self = this
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
            .value()
            .map((item) => {return {id: item.id, lang: item.__language_code}})

        for (let chat of chats) {
            const messages = []

            for (let change of changes) {
                console.log(change)
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
            } catch (error) {
                this.logger.error('Error sendMessage: ', error)
            }
        }
    }
}

module.exports = Notifier
