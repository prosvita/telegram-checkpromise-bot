module.exports = {
    appName: process.env.APP_NAME || 'bot',
    tgToken: process.env.TG_TOKEN || '000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    bitlyToken: process.env.BITLY_TOKEN,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
    dataUrl: process.env.DATA_JSON || 'http://127.0.0.1:8080/test/data.json',
    schedule: process.env.SCHEDULE || '*/15 * * * * *',
    logLevel: process.env.LOG_LEVEL || 'debug'
}
