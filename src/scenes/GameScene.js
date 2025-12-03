import Phaser from 'phaser';
import { HexGrid } from '../utils/HexGrid.js';
import { GAME_CONFIG } from '../config.js';

/**
 * Main game scene for Stranglethorn
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.hexGrid = null;
    this.hexGraphics = null;
    this.highlightGraphics = null;
    this.hoveredHex = null;
    this.selectedHex = null;
  }

  preload() {
    // TODO: Load board image and sprites
    // this.load.image('board', 'assets/board/stranglethorn_board.png');
  }

  create() {
    // Initialize hex grid system
    this.hexGrid = new HexGrid(
      GAME_CONFIG.hexSize,
      GAME_CONFIG.gridOriginX,
      GAME_CONFIG.gridOriginY
    );

    // Create graphics layers
    this.boardBackground = this.add.graphics();
    this.hexGraphics = this.add.graphics();
    this.highlightGraphics = this.add.graphics();

    // Draw temporary board background
    this.drawTempBackground();

    // Draw hex grid overlay
    this.drawHexGrid();

    // Set up interactivity
    this.setupInteractivity();

    // Add debug text
    this.debugText = this.add.text(10, 10, '', {
      font: '16px monospace',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // Add title text
    this.add.text(GAME_CONFIG.width / 2, 30, 'STRANGLETHORN - HEX GRID SYSTEM', {
      font: 'bold 32px monospace',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Add instructions
    this.add.text(GAME_CONFIG.width / 2, 70, 'Hover over hexes to see coordinates | Click to select', {
      font: '18px monospace',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    console.log('Stranglethorn: Hex grid system initialized');
    console.log('Hex size:', GAME_CONFIG.hexSize);
    console.log('Grid origin:', GAME_CONFIG.gridOriginX, GAME_CONFIG.gridOriginY);
  }

  /**
   * Draw temporary board background (placeholder until board image is added)
   */
  drawTempBackground() {
    this.boardBackground.fillStyle(0x2a2a2a, 1);
    this.boardBackground.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    // Draw a border
    this.boardBackground.lineStyle(4, 0x00ff00, 1);
    this.boardBackground.strokeRect(50, 100, GAME_CONFIG.width - 100, GAME_CONFIG.height - 150);
  }

  /**
   * Draw the hex grid overlay
   */
  drawHexGrid() {
    this.hexGraphics.clear();

    const halfCols = Math.ceil(GAME_CONFIG.gridCols / 2);
    const halfRows = Math.ceil(GAME_CONFIG.gridRows / 2);

    // Draw hexes in a rectangular pattern centered on origin
    for (let q = -halfCols; q <= halfCols; q++) {
      for (let r = -halfRows; r <= halfRows; r++) {
        const pos = this.hexGrid.axialToPixel(q, r);

        // Only draw hexes that are on screen
        if (pos.x > -GAME_CONFIG.hexSize && pos.x < GAME_CONFIG.width + GAME_CONFIG.hexSize &&
            pos.y > -GAME_CONFIG.hexSize && pos.y < GAME_CONFIG.height + GAME_CONFIG.hexSize) {

          this.hexGrid.drawHex(
            this.hexGraphics,
            q,
            r,
            GAME_CONFIG.colors.hexOutline,
            GAME_CONFIG.hexOutlineAlpha,
            GAME_CONFIG.hexOutlineWidth
          );
        }
      }
    }
  }

  /**
   * Set up mouse interactivity for hex selection
   */
  setupInteractivity() {
    this.input.on('pointermove', (pointer) => {
      const axial = this.hexGrid.pixelToAxial(pointer.x, pointer.y);

      // Check if hovering over a new hex
      if (!this.hoveredHex || this.hoveredHex.q !== axial.q || this.hoveredHex.r !== axial.r) {
        this.hoveredHex = axial;
        this.updateHighlight();
        this.updateDebugText();
      }
    });

    this.input.on('pointerdown', (pointer) => {
      const axial = this.hexGrid.pixelToAxial(pointer.x, pointer.y);
      this.selectedHex = axial;
      this.updateHighlight();
      this.updateDebugText();

      console.log('Selected hex:', axial);
    });
  }

  /**
   * Update hex highlight graphics
   */
  updateHighlight() {
    this.highlightGraphics.clear();

    // Highlight hovered hex
    if (this.hoveredHex) {
      this.hexGrid.fillHex(
        this.highlightGraphics,
        this.hoveredHex.q,
        this.hoveredHex.r,
        GAME_CONFIG.colors.hexHover,
        GAME_CONFIG.hexHoverAlpha * 0.3
      );

      this.hexGrid.drawHex(
        this.highlightGraphics,
        this.hoveredHex.q,
        this.hoveredHex.r,
        GAME_CONFIG.colors.hexHover,
        GAME_CONFIG.hexHoverAlpha,
        3
      );
    }

    // Highlight selected hex
    if (this.selectedHex) {
      this.hexGrid.fillHex(
        this.highlightGraphics,
        this.selectedHex.q,
        this.selectedHex.r,
        GAME_CONFIG.colors.hexSelected,
        GAME_CONFIG.hexSelectedAlpha * 0.3
      );

      this.hexGrid.drawHex(
        this.highlightGraphics,
        this.selectedHex.q,
        this.selectedHex.r,
        GAME_CONFIG.colors.hexSelected,
        GAME_CONFIG.hexSelectedAlpha,
        4
      );
    }
  }

  /**
   * Update debug information display
   */
  updateDebugText() {
    let text = 'HEX GRID DEBUG INFO\n\n';

    if (this.hoveredHex) {
      const pixel = this.hexGrid.axialToPixel(this.hoveredHex.q, this.hoveredHex.r);
      text += `Hovered: q=${this.hoveredHex.q}, r=${this.hoveredHex.r}\n`;
      text += `Position: x=${Math.round(pixel.x)}, y=${Math.round(pixel.y)}\n\n`;
    }

    if (this.selectedHex) {
      const pixel = this.hexGrid.axialToPixel(this.selectedHex.q, this.selectedHex.r);
      text += `Selected: q=${this.selectedHex.q}, r=${this.selectedHex.r}\n`;
      text += `Position: x=${Math.round(pixel.x)}, y=${Math.round(pixel.y)}\n`;

      // Calculate distance if both hexes are set
      if (this.hoveredHex && (this.hoveredHex.q !== this.selectedHex.q || this.hoveredHex.r !== this.selectedHex.r)) {
        const distance = this.hexGrid.distance(
          this.hoveredHex.q,
          this.hoveredHex.r,
          this.selectedHex.q,
          this.selectedHex.r
        );
        text += `\nDistance: ${distance} hexes`;
      }
    }

    this.debugText.setText(text);
  }

  update() {
    // Game loop updates will go here
  }
}
