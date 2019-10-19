'use strict'

const Extra = require('telegraf/extra')
const ClearText = require('./clear_text')
const conf = require('./config')

class Notifier {
    /* eslint max-params: "off" */
    constructor (logger, telegram, session, i18n) {
        this.logger = logger
        this.telegram = telegram
        this.session = session
        this.i18n = i18n
        this.clearText = new ClearText(logger)
    }

    /* eslint class-methods-use-this: "off" */
    start () {
        return (ctx) => {
            ctx.reply(ctx.i18n.t('/start message'), Extra.markdown())
        }
    }

    /* eslint class-methods-use-this: "off" */
    anyText () {
        return (ctx) => {
            ctx.reply(ctx.i18n.t('anyText message'), Extra.markdown())
        }
    }

    /* eslint class-methods-use-this: "off" */
    anyMessage () {
        return (ctx) => {
            ctx.reply(ctx.i18n.t('anyMessage message'), Extra.markdown())
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
            await this.sendMessage(chat.id, message, chat.lang) /* eslint no-await-in-loop: "off" */
        }
    }

    makeMessage (changes, lang) {
        const messages = []

        for (const change of changes) {
            if (change.news) {
                messages.push(`${change.news}\n`)
            } else if (change.measure === 'promise') {
                this.addPromiseMessage(change, messages, lang);
            } else {
                this.addIndicatorMessage(change, messages, lang);
            }
        }

        return messages.join('\n')
    }

    addIndicatorMessage (change, messages, lang) {
        const oddsValue = change.oldValue - change.newValue;
        const isOldValueLess = change.oldValue < change.newValue;
        messages.push(`${
            this.i18n.t(
                lang,
                isOldValueLess === change.invertArrow ? 'notify/improvements' : 'notify/treason'
            )
        }\n[${change.description}](https://www.checkpromise.info/${change.id}?utm_medium=referral&utm_source=telegram_bot) ${
            isOldValueLess ? '↑' : '↓'
        } ${change.newValue} ${change.quantity} ${change.measure} (${oddsValue})`)
    }

    addPromiseMessage (change, messages, lang) {
        let statusMessage = '';
        if (change.newValue === 1) {
            statusMessage = this.i18n.t(lang, 'notify/completed')
        } else if (change.newValue === 2) {
            statusMessage = this.i18n.t(lang, 'notify/notcompleted')
        } else {
            return
        }
        messages.push(`${statusMessage}\n${change.description}`)
    }

    async sendMessage (chatId, message, lang) {
        const markup = await this.makeShareButtons(Extra.markdown(), message, lang)

        try {
            await this.telegram.sendMessage(chatId, message, markup)
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

    async makeShareButtons (markup, message, lang) {
        if (typeof conf.facebookAppId === 'undefined' || conf.facebookAppId === '') {
            return markup
        }

        const plainMessage = await this.clearText.clearMD(message, {onlyText: true})
        const facebookMessage = this.clearText.clearEmoji(plainMessage)
        const facebookUrl = `https://www.facebook.com/dialog/share?app_id=${
            conf.facebookAppId}&display=popup&quote=${
            encodeURIComponent(facebookMessage)}&href=${
            encodeURIComponent(await this.clearText.shorten('https://www.checkpromise.info?utm_medium=referral&utm_source=telegram_bot&utm_campaign=facebook'))}&redirect_uri=${
            encodeURIComponent('https://www.checkpromise.info?utm_medium=referral&utm_source=telegram_bot&utm_campaign=share')}`

        return markup.markup((m) => m.inlineKeyboard([
            m.urlButton(this.i18n.t(lang, 'notify/share facebook'), facebookUrl)
        ]))
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
