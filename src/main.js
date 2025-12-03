import Phaser from 'phaser';
import { phaserConfig } from './config.js';
import { GameScene } from './scenes/GameScene.js';

/**
 * Stranglethorn Game Entry Point
 */

// Add scenes to config
const config = {
  ...phaserConfig,
  scene: [GameScene]
};

// Create game instance
const game = new Phaser.Game(config);

// Log game initialization
console.log('🎮 Stranglethorn: Hex-Based Tactical Board Game');
console.log('Built with Phaser.js v' + Phaser.VERSION);
console.log('Phase 1: Hex Grid System - Active');
