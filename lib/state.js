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
            const { body } = await got.get(conf.dataUrl, {json: true})
            return body
        } catch (error) {
            logger.error(error)
        }
        return null
    }

    async check () {
        const {chartData, promiseData} = await this.get()
        const result = []

        for (let p of chartData) {
            const key = stringHash(p.label)
            if (key in this.data && this.data[key] !== p.currentData.value) {
                result.push({
                    description: p.label,
                    invertArrow: p.invertArrow,
                    oldValue: parseFloat(this.data[key].replace(/ /g, '').replace(/,/, '.')),
                    newValue: parseFloat(p.currentData.value.replace(/ /g, '').replace(/,/, '.')),
                    measure: p.measure
                })
            }
            this.data[key] = p.currentData.value
        }

        for (let p of promiseData) {
            const key = stringHash(p.description)
            if (key in this.data && this.data[key] !== p.completed) {
                result.push({
                    description: p.description,
                    invertArrow: true,
                    oldValue: this.data[key],
                    newValue: p.completed,
                    measure: 'completed'
                })
            }
            this.data[key] = p.completed
        }

        return result
    }
}

module.exports = State
