# 🎮 STRANGLETHORN

**Hex-Based Tactical Board Game | Built with Phaser.js**

## Overview

Stranglethorn is a 1v1 strategic hex board game where players control Hunters, command minions, and battle for territorial supremacy. Victory comes through reducing the enemy Hunter to 0 HP or destroying all 6 enemy structures.

## Current Status: Phase 1 - Foundation

### ✅ Completed Features
- Phaser.js project setup with Vite
- Hex grid system with axial coordinates
- Interactive hex grid overlay
- Coordinate system visualization
- Distance calculation system

### 🎯 Phase 1 Remaining Tasks
- Dice rolling UI
- Hunter placement & movement
- Turn system

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Hex Grid System

The game uses an **axial coordinate system** with flat-top hexagons:

- **Coordinates**: `(q, r)` where q is column and r is row
- **Distance Formula**: `(|q1-q2| + |r1-r2| + |(q1+r1)-(q2+r2)|) / 2`
- **Hex Size**: 40px radius (configurable in `src/config.js`)

### Interactive Features

- **Hover**: Yellow highlight shows current hex coordinates
- **Click**: Red highlight selects a hex
- **Distance Display**: Shows hex distance between selected and hovered hex

## Project Structure

```
stranglethorn-game/
├── src/
│   ├── main.js              # Entry point
│   ├── config.js            # Game configuration
│   ├── scenes/
│   │   └── GameScene.js     # Main game scene with hex grid
│   └── utils/
│       └── HexGrid.js       # Hex coordinate system utilities
├── assets/
│   ├── board/               # Board images
│   └── sprites/             # Hunter, minion, structure sprites
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies

```

## HexGrid Utility Class

The `HexGrid` class provides essential methods for hex-based gameplay:

### Core Methods

- `axialToPixel(q, r)` - Convert hex coordinates to screen position
- `pixelToAxial(x, y)` - Convert screen position to hex coordinates
- `distance(q1, r1, q2, r2)` - Calculate distance between hexes
- `getNeighbors(q, r)` - Get all adjacent hex coordinates
- `getHexesInRange(q, r, range)` - Get all hexes within range
- `drawHex(graphics, q, r, color, alpha, lineWidth)` - Draw hex outline
- `fillHex(graphics, q, r, color, alpha)` - Draw filled hex

## Game Configuration

Edit `src/config.js` to customize:

- Canvas dimensions
- Hex grid size and origin
- Grid coverage area
- Colors and visual styles

## Next Steps (Phase 1)

1. **Dice Rolling UI** - Add d6 roller with animation
2. **Hunter Sprites** - Load and place hunter characters
3. **Movement System** - Implement hex-based movement with dice rolls
4. **Turn Management** - Player switching and state tracking

## Tech Stack

- **Phaser 3** - Game framework
- **Vite** - Build tool and dev server
- **JavaScript ES6+** - Modern JavaScript

## Development Notes

- The hex grid is currently rendered as an overlay on a placeholder background
- Grid coordinates are displayed in real-time for development
- Distance calculations are tested and visualized interactively

---

**Game Design Document**: See full GDD for complete mechanics, phases, and implementation details
