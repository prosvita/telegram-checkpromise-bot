# Telegram Bot для стеження за успіхами влади
[![Build Status](https://travis-ci.org/prosvita/telegram-checkpromise-bot.svg?branch=master)](https://travis-ci.org/prosvita/telegram-checkpromise-bot)

## Розробка

```sh
# Встановлення залежностей
npm i

# Запуск сервера для завантаження даних
npm run dev-static

# Запуск бота
TG_TOKEN="000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" npm run dev
```

## Конфігурація

Бот налаштовується зміною конфігураційних файлів в `/configs/*/node.js` в залежності від змінної оточення `NODE_ENV`.

## Production

```sh
# Встановлення залежностей
npm i --production

# Запуск бота
NODE_ENV=production TG_TOKEN="000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" node index.js
```

### Запуск в docker

```sh
docker run -d \
    --name tg-checkpromise \
    -e TG_TOKEN="000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
    -v $(pwd)/db:/app/db \
    levonet/telegram-checkpromise-bot
```
