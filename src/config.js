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

export const STRUCTURE_CONFIG = {
  pulseCannon: { name: 'Pulse Cannon', hp: 5, cooldown: 0, cost: 0, description: 'Deals 1 damage to enemy structure' },
  fightingPits: { name: 'Fighting Pits', hp: 9, cooldown: 0, cost: 0, description: 'Battle NPCs for Thorns & XP' },
  swarmPortal: { name: 'Swarm Portal', hp: 6, cooldown: 3, cost: 0, description: 'Spawns Swarmling every 3 turns' },
  ammoVein: { name: 'Ammo Vein', hp: 3, cooldown: 1, cost: 0, description: 'Collect 1 ammo' },
  swarmMother: { name: 'Swarm Mother', hp: 3, cooldown: 3, cost: 0, description: 'Boss: Drops 2 Thorns' },
  gateKeeper: { name: 'GateKeeper', hp: 4, cooldown: 3, cost: 0, description: 'Boss: Drops 5 Thorns' },
};

export const STRANGLETHORN_CONFIG = {
  tiers: [
    { hp: 5, defense: 5 },   // T1
    { hp: 10, defense: 10 }, // T2
    { hp: 15, defense: 15 }, // T3
    { hp: 20, defense: 20 }, // T4
    { hp: 25, defense: 25 }  // T5
  ]
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
