module.exports = {
    appName: process.env.APP_NAME || 'bot',
    tgToken: process.env.TG_TOKEN || '000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    bitlyToken: process.env.BITLY_TOKEN,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'uk',
    dataUrl: process.env.DATA_JSON || 'https://www.checkpromise.info/assets/data/data.json',
    schedule: process.env.SCHEDULE || '0 10 * * *',
    logLevel: process.env.LOG_LEVEL || 'info'
}
