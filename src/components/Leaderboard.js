// src/components/Leaderboard.js

import React from 'react';
import './Leaderboard.css';

function Leaderboard({ leaderboardData, currentUser, onClose }) {
  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <h2>Рейтинг</h2>
        <table>
          <thead>
            <tr>
              <th>Место</th>
              <th>Имя</th>
              <th>Лучший результат</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr
                key={player.id}
                className={player.id === currentUser.id ? 'highlight' : ''}
              >
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.bestScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;
