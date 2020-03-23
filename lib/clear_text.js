'use strict'

const {BitlyClient} = require('bitly')
const mem = require('mem')
const conf = require('./config')

class ClearText {
    constructor (logger) {
        this.logger = logger

        this.isShortenOn = false
        this.getShorten = (str) => Promise.resolve({link: str})
        if (typeof conf.bitlyToken !== 'undefined' && conf.bitlyToken !== '') {
            try {
                this.bitly = new BitlyClient(conf.bitlyToken, {})
                this.getShorten = mem(this.bitly.shorten).bind(this.bitly)
                this.isShortenOn = true
            } catch (error) {
                this.logger.error(error)
            }
        }
    }

    async clearMD (str, opts = {}) {
        let result = str

        result = result.replace(/(^|\b|\W|\s)(\*{1,2})(\S(.*?\S)?)\2(\b|\W|\s|$)/gu, '$1$3$5')
        result = result.replace(/(^|\b|\W|\s)(_{1,2})(\S(.*?\S)?)\2(\b|\W|\s|$)/gu, '$1$3$5')
        result = result.replace(/\B```([^```]+)```\B/gu, '$1')
        result = result.replace(/\B`([^`]+)`\B/gu, '$1')
        result = await this.replaceUri(result, opts)

        return result
    }

    /* eslint class-methods-use-this: "off" */
    clearEmoji (str) {
        return str.replace(/✅/ug, '✓')
            .replace(/⛔️/ug, '✗')
            .replace(/😀/ug, ':)')
            .replace(/🤢/ug, ':(')
            .replace(/\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/ug, '')
    }

    async replaceUri (str, opts = {}) {
        const regex = /\[([^\[\]]+)\]\(([^)]+)\)/gu
        const promises = []

        if (opts.onlyText) {
            return str.replace(regex, '$1')
        }

        str.replace(regex, (match, ...args) => {
            const promise = this.wrapperShorten(match, ...args)
            promises.push(promise)
        })
        const data = await Promise.all(promises)

        return str.replace(regex, () => data.shift())
    }

    async wrapperShorten (str, p1, p2) {
        try {
            const result = await this.getShorten(p2)

            return `${p1} ${result.link} `
        } catch (error) {
            this.logger.error(error)
        }

        return p1
    }

    async shorten (url) {
        if (!this.isShortenOn) {
            return url
        }

        try {
            const result = await this.getShorten(url)

            return result.link
        } catch (error) {
            this.logger.error(error)
        }

        return url
    }
}

module.exports = ClearText
