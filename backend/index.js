// backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const leaderboardRoutes = require('./routes/leaderboard');
const db = require('./database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/leaderboard', leaderboardRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.send('Backend сервера работает');
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
