# Telegram Bot для стеження за успіхами влади

## Розробка

```sh
# Встановлення залежностей
npm i

# Запуск сервера для завантаження даних
npm run static

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
