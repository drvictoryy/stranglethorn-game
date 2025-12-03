import Phaser from 'phaser';

/**
 * Stranglethorn Game Configuration
 */

export const GAME_CONFIG = {
  // Canvas dimensions
  width: 1920,
  height: 1080,

  // Hex grid configuration
  hexSize: 40, // Radius of hexagon (center to corner)
  gridOriginX: 960, // Center of screen
  gridOriginY: 540,

  // Grid dimensions (approximate coverage)
  gridCols: 20,
  gridRows: 15,

  // Colors
  colors: {
    hexOutline: 0x00ff00,
    hexHover: 0xffff00,
    hexSelected: 0xff0000,
    background: 0x1a1a1a
  },

  // UI
  hexOutlineAlpha: 0.3,
  hexOutlineWidth: 2,
  hexHoverAlpha: 0.6,
  hexSelectedAlpha: 0.8
};

export const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};
