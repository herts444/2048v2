// src/components/Game.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tile from './Tile';
import Leaderboard from './Leaderboard';
import './Game.css';
import { triggerHaptic } from '../utils/haptic';
import axios from 'axios';

const size = 4;

function Game() {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [telegramReady, setTelegramReady] = useState(false);
  const [currentUser] = useState({
    id: 'user123', // Уникальный ID пользователя
    name: 'Вы', // Имя пользователя
  });

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Мемоизация функции fetchLeaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await axios.get('https://app.hotgaming.lol/api/leaderboard');
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Ошибка при получении Leaderboard:', err);
    }
  }, []);

  // Мемоизация функции updateLeaderboard с добавлением fetchLeaderboard в зависимости
  const updateLeaderboard = useCallback(
    async (newScore) => {
      try {
        await axios.post('https://app.hotgaming.lol/api/leaderboard', {
          id: currentUser.id,
          name: currentUser.name,
          score: newScore,
        });
        fetchLeaderboard();
      } catch (err) {
        console.error('Ошибка при обновлении Leaderboard:', err);
      }
    },
    [currentUser.id, currentUser.name, fetchLeaderboard]
  );

  // Определение handleOpenLeaderboard
  const handleOpenLeaderboard = useCallback(() => {
    fetchLeaderboard();
    setIsLeaderboardOpen(true);
  }, [fetchLeaderboard]);

  // Определение handleCloseLeaderboard
  const handleCloseLeaderboard = useCallback(() => {
    setIsLeaderboardOpen(false);
  }, []);

  useEffect(() => {
    if (gameOver) {
      updateLeaderboard(score);
    }
  }, [gameOver, score, updateLeaderboard]);

  useEffect(() => {
    console.log('Проверка объекта Telegram до инициализации:', window.Telegram);

    const initGame = () => {
      let newGrid = createEmptyGrid();
      newGrid = addRandomTile(newGrid);
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(0);
      setGameOver(false);
      setHistory([]);
      console.log('Игра инициализирована');
    };

    initGame();

    const checkTelegram = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp API доступен');
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        setTelegramReady(true);
      } else {
        console.warn('Telegram WebApp API недоступен. Запустите приложение через Telegram.');
        setTelegramReady(false);
      }
    };

    const telegramCheckInterval = setInterval(() => {
      if (window.Telegram && window.Telegram.WebApp) {
        clearInterval(telegramCheckInterval);
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        setTelegramReady(true);
        console.log('Telegram WebApp API теперь доступен');
      }
    }, 500);

    const telegramCheckTimeout = setTimeout(() => {
      clearInterval(telegramCheckInterval);
      checkTelegram();
    }, 10000);

    // Отключаем системные свайпы вниз
    const preventSwipe = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventSwipe, { passive: false });

    return () => {
      clearInterval(telegramCheckInterval);
      clearTimeout(telegramCheckTimeout);
      document.removeEventListener('touchmove', preventSwipe);
    };
  }, []);

  const createEmptyGrid = () => {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
  };

  const addRandomTile = (grid) => {
    let emptyCells = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (grid[x][y] === null) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      return grid;
    }

    let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let newGrid = grid.map((row) => row.slice());
    newGrid[randomCell.x][randomCell.y] = {
      id: Date.now() + Math.random(),
      value: Math.random() < 0.9 ? 2 : 4,
      merged: false,
      new: true,
    };
    return newGrid;
  };

  const cloneGrid = (grid) => {
    return grid.map((row) => row.map((tile) => (tile ? { ...tile } : null)));
  };

  const move = useCallback(
    (direction) => {
      if (gameOver) return;

      setHistory((prevHistory) => [
        ...prevHistory,
        { grid: cloneGrid(grid), score },
      ]);

      let newGrid = grid.map((row) => row.slice());
      let moved = false;
      let scoreIncrement = 0;

      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          let tile = newGrid[x][y];
          if (tile) {
            tile.merged = false;
            tile.new = false;
          }
        }
      }

      const moveRow = (row) => {
        let newRow = row.filter((tile) => tile !== null);
        for (let i = 0; i < newRow.length - 1; i++) {
          if (
            newRow[i + 1] &&
            newRow[i].value === newRow[i + 1].value &&
            !newRow[i].merged &&
            !newRow[i + 1].merged
          ) {
            triggerHaptic('medium');

            newRow[i].value *= 2;
            newRow[i].merged = true;
            scoreIncrement += newRow[i].value;
            newRow.splice(i + 1, 1);
            moved = true;
            i--;
          }
        }
        while (newRow.length < size) {
          newRow.push(null);
        }
        return newRow;
      };

      const rotateGrid = (gridToRotate) => {
        let rotatedGrid = createEmptyGrid();
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            rotatedGrid[size - 1 - y][x] = gridToRotate[x][y];
          }
        }
        return rotatedGrid;
      };

      let numRotations = 0;
      if (direction === 'left') {
        numRotations = 0;
      } else if (direction === 'up') {
        numRotations = 1;
      } else if (direction === 'right') {
        numRotations = 2;
      } else if (direction === 'down') {
        numRotations = 3;
      }

      for (let i = 0; i < numRotations; i++) {
        newGrid = rotateGrid(newGrid);
      }

      for (let x = 0; x < size; x++) {
        let row = newGrid[x];
        let originalRow = row.map((tile) => (tile ? { ...tile } : null));
        let movedRow = moveRow(row);

        newGrid[x] = movedRow;

        if (JSON.stringify(originalRow) !== JSON.stringify(movedRow)) {
          moved = true;
        }
      }

      for (let i = 0; i < (4 - numRotations) % 4; i++) {
        newGrid = rotateGrid(newGrid);
      }

      if (moved) {
        newGrid = addRandomTile(newGrid);
        setScore((prevScore) => prevScore + scoreIncrement);
        if (isGameOver(newGrid)) {
          setGameOver(true);
        }
        setGrid(newGrid);
      } else {
        setHistory((prevHistory) => prevHistory.slice(0, -1));
      }
    },
    [gameOver, grid, score]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;

      let direction = null;
      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return;
      }
      e.preventDefault();
      move(direction);
    },
    [gameOver, move]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const minSwipeDistance = 30;

    if (Math.max(absDeltaX, absDeltaY) > minSwipeDistance) {
      let direction = null;
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      move(direction);
    }
  };

  const isGameOver = (grid) => {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (grid[x][y] === null) {
          return false;
        }
        if (x < size - 1 && grid[x][y].value === grid[x + 1][y]?.value) {
          return false;
        }
        if (y < size - 1 && grid[x][y].value === grid[x][y + 1]?.value) {
          return false;
        }
      }
    }
    return true;
  };

  const resetGame = () => {
    triggerHaptic('medium');
    setHistory([]);
    initGame();
  };

  // Инициализация игры
  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, []);

  const undo = () => {
    if (history.length === 0) {
      console.warn('Нет ходов для отмены.');
      return;
    }

    // Удаляем последний элемент истории и восстанавливаем состояние
    const previousState = history[history.length - 1];
    setGrid(previousState.grid);
    setScore(previousState.score);

    // Обновляем историю, удаляя последний элемент
    setHistory((prevHistory) => prevHistory.slice(0, -1));

    // Сбрасываем флаг gameOver, если он установлен
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
    // Telegram и другие инициализации остаются без изменений
  }, [initGame]);

  return (
    <div
      className="game-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Иконка Leaderboard */}
      <div
        className="leaderboard-icon"
        onClick={handleOpenLeaderboard}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          fontSize: '24px',
        }}
      >
        🏆
      </div>
      
      <h1>2048</h1>
      <div className="score">Счёт: {score}</div>
      <div className="grid">
        {grid.map((row, x) =>
          row.map((tile, y) => (
            <div key={`${x}-${y}`} className="grid-cell">
              {tile && <Tile tile={{ ...tile, x, y }} />}
            </div>
          ))
        )}
      </div>
      {gameOver && (
        <div className="game-over">
          <p>Игра окончена!</p>
        </div>
      )}
      <div className="controls">
        <button onClick={undo} disabled={history.length === 0}>
          Вернуться назад
        </button>
        <button onClick={resetGame}>Начать заново</button>
      </div>
      {!telegramReady && (
        <div className="telegram-warning">
          <p>Telegram WebApp API недоступен. Запустите приложение через Telegram.</p>
        </div>
      )}
      {isLeaderboardOpen && (
        <Leaderboard
          leaderboardData={leaderboard}
          currentUser={currentUser}
          onClose={handleCloseLeaderboard}
        />
      )}
    </div>
  );
}

export default Game;
