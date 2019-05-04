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
        const {chartData, promiseData} = await this.get()
        const result = []

        this.checkChartData(result, chartData)
        this.checkPromiseData(result, promiseData)

        return result
    }

    checkChartData (result, chartData) {
        for (const data of chartData) {
            const key = stringHash(data.label)
            if (key in this.data && this.data[key] !== data.currentData.value) {
                result.push({
                    description: data.label,
                    invertArrow: data.invertArrow,
                    oldValue: parseFloat(this.data[key].replace(/ /gu, '').replace(/,/u, '.')),
                    newValue: parseFloat(data.currentData.value.replace(/ /gu, '').replace(/,/u, '.')),
                    measure: data.measure
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
}

module.exports = State
