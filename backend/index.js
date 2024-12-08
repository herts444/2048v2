// backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const leaderboardRoutes = require('./routes/leaderboard');
const db = require('./database');

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Middleware для обработки CORS
app.use(cors({
  origin: '*', // Разрешить запросы от любых источников
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Дополнительные заголовки для CORS (если потребуется)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware для обработки JSON
app.use(express.json());

// Подключение маршрутов
app.use('/api/leaderboard', leaderboardRoutes);

// Главная страница для проверки доступности
app.get('/', (req, res) => {
  res.send('Backend сервера работает');
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
