// backend/routes/leaderboard.js

const express = require('express');
const router = express.Router();
const db = require('../database');

// Получение топ-10 игроков
router.get('/', (req, res) => {
  const sql = `SELECT * FROM players ORDER BY bestScore DESC LIMIT 10`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
});

// Добавление или обновление игрока
router.post('/', (req, res) => {
  const { id, name, score } = req.body;

  if (!id || !name || typeof score !== 'number') {
    return res.status(400).json({ message: 'Недостаточно данных для обновления.' });
  }

  // Проверка существования игрока
  const selectSql = `SELECT * FROM players WHERE id = ?`;
  db.get(selectSql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (row) {
      // Обновляем лучший счёт, если новый выше
      if (score > row.bestScore) {
        const updateSql = `UPDATE players SET bestScore = ? WHERE id = ?`;
        db.run(updateSql, [score, id], function(err) {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          res.json({ id, name, bestScore: score });
        });
      } else {
        res.json(row);
      }
    } else {
      // Создаём нового игрока
      const insertSql = `INSERT INTO players (id, name, bestScore) VALUES (?, ?, ?)`;
      db.run(insertSql, [id, name, score], function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.json({ id, name, bestScore: score });
      });
    }
  });
});

module.exports = router;
