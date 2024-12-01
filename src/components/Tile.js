// src/components/Tile.js

import React from 'react';
import './Tile.css';

function Tile({ tile }) {
  const { value } = tile;

  const getTileClass = () => {
    let classes = ['tile', `tile-${value}`];
    if (tile.merged) classes.push('tile-merged');
    if (tile.new) classes.push('tile-new');
    return classes.join(' ');
  };

  return (
    <div className={getTileClass()}>
      {value}
    </div>
  );
}

export default Tile;
