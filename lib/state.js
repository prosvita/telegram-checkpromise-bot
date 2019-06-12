'use strict'

const got = require('got');
const conf = require('./config')
const stringHash = require('string-hash')

class State {
    constructor (logger) {
        this.logger = logger
        this.data = {}
    }

    async get () {
        try {
            const {body} = await got.get(conf.dataUrl, {json: true})

            return body
        } catch (error) {
            this.logger.error('ERROR GET dataUrl %s', error)
        }

        return null
    }

    async check () {
        const {indicatorData, promiseData, news} = await this.get()
        const result = []

        this.checkIndicatorData(result, indicatorData)
        this.checkPromiseData(result, promiseData)
        this.checkNews(result, news);

        return result
    }

    checkIndicatorData (result, indicatorData) {
        for (const data of indicatorData) {
            const key = stringHash(data.label)
            const currentData = data.currentData
            if (key in this.data && this.data[key] !== currentData.value) {
                result.push({
                    id: data.id,
                    description: data.label,
                    invertArrow: data.invertArrow,
                    oldValue: parseFloat(this.data[key].replace(/ /gu, '').replace(/,/u, '.')),
                    newValue: parseFloat(currentData.value.replace(/ /gu, '').replace(/,/u, '.')),
                    measure: data.measure,
                    quantity: currentData.quantity || ''
                })
            }
            this.data[key] = data.currentData.value
        }
    }

    checkPromiseData (result, promiseData) {
        for (const data of promiseData) {
            const key = stringHash(data.description)
            if (key in this.data && this.data[key] !== data.completed) {
                result.push({
                    description: data.description,
                    invertArrow: true,
                    oldValue: this.data[key],
                    newValue: data.completed,
                    measure: 'completed'
                })
            }
            this.data[key] = data.completed
        }
    }

    checkNews (result, news) {
        for (const data of news) {
            const key = stringHash(data.value)
            const dateStr = data.date.split('.')
            const date = new Date(dateStr[2], dateStr[1] - 1, dateStr[0])
            if (date > new Date()) {
                continue
            }
            if (!(key in this.data)) {
                result.push({
                    news: data.value
                })
            }
            this.data[key] = true
        }
    }
}

module.exports = State
