import Phaser from 'phaser';
import { HexGrid } from '../utils/HexGrid.js';
import { GAME_CONFIG, STRUCTURE_CONFIG, STRANGLETHORN_CONFIG } from '../config.js';

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

    // Game state
    this.gameState = {
      currentPlayer: 1,
      phase: 'hunterSelection', // hunterSelection, placement, playing
      diceRoll: null,
      remainingMoves: 0,
      players: {
        1: { hunter: null, hunterSprite: null, position: null, structures: {}, resources: { thorns: 0, ammo: 0, souls: 0 } },
        2: { hunter: null, hunterSprite: null, position: null, structures: {}, resources: { thorns: 0, ammo: 0, souls: 0 } }
      },
      stranglethorns: []
    };
  }

  preload() {
    // Load board
    this.load.image('board', 'assets/board/stranglethorn_board.png');

    // Load hunter sprites
    this.load.image('zahra', 'assets/sprites/hunters/zahra.png');
    this.load.image('andromeda', 'assets/sprites/hunters/andromeda.png');
    this.load.image('nox', 'assets/sprites/hunters/nox.png');
    this.load.image('lugh', 'assets/sprites/hunters/lugh.png');

    // Load structure sprites
    this.load.image('pulse_cannon', 'assets/sprites/structures/pulse_cannon.png');
    this.load.image('fighting_pits', 'assets/sprites/structures/fighting_pits.png');
    this.load.image('swarm_portal', 'assets/sprites/structures/swarm_portal.png');
    this.load.image('ammo_vein', 'assets/sprites/structures/ammo_vein.png');
    this.load.image('swarm_mother', 'assets/sprites/structures/swarm_mother.png');
    this.load.image('gatekeeper', 'assets/sprites/structures/gatekeeper.png');
    this.load.image('temple', 'assets/sprites/structures/temple.png');
    this.load.image('barracks', 'assets/sprites/structures/barracks.png');

    // Load stranglethorn sprites
    this.load.image('stranglethorn_base', 'assets/sprites/stranglethorns/base.png');
  }

  create() {
    // Initialize hex grid system
    this.hexGrid = new HexGrid(
      GAME_CONFIG.hexSize,
      GAME_CONFIG.gridOriginX,
      GAME_CONFIG.gridOriginY
    );

    // Add board image as background
    const board = this.add.image(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 'board');

    // Scale board to fit screen while maintaining aspect ratio
    const scaleX = GAME_CONFIG.width / board.width;
    const scaleY = GAME_CONFIG.height / board.height;
    const scale = Math.max(scaleX, scaleY);
    board.setScale(scale);

    // Create graphics layers
    this.hexGraphics = this.add.graphics();
    this.highlightGraphics = this.add.graphics();

    // Draw hex grid overlay
    this.drawHexGrid();

    // Initialize and draw structures
    this.initializeStructures();
    this.initializeStranglethorns();

    // Set up interactivity
    this.setupInteractivity();

    // Create UI elements
    this.createUI();

    console.log('Stranglethorn: Game initialized');
    console.log('Phase:', this.gameState.phase);
  }

  /**
   * Create UI elements (hunter selection, dice, turn info)
   */
  createUI() {
    // Game title
    this.add.text(GAME_CONFIG.width / 2, 30, 'STRANGLETHORN', {
      font: 'bold 48px monospace',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(1000);

    // Current phase/instruction text
    this.phaseText = this.add.text(GAME_CONFIG.width / 2, 85, '', {
      font: 'bold 20px monospace',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(1000);

    // Player info panel (top left)
    this.playerInfoText = this.add.text(20, 120, '', {
      font: '16px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 15, y: 10 }
    }).setDepth(1000);

    // Dice UI panel (top right)
    this.dicePanel = this.createDicePanel();

    // Hunter selection panel (shown during hunter selection phase)
    this.hunterSelectionPanel = this.createHunterSelectionPanel();

    // Update UI based on current phase
    this.updateUI();
  }

  /**
   * Create dice rolling panel
   */
  createDicePanel() {
    const panel = this.add.container(GAME_CONFIG.width - 220, 120);
    panel.setDepth(1000);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(0, 0, 200, 150, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(0, 0, 200, 150, 10);
    panel.add(bg);

    // Dice display
    const diceText = this.add.text(100, 40, '?', {
      font: 'bold 48px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);
    panel.add(diceText);

    // Roll button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x00aa00, 1);
    buttonBg.fillRoundedRect(25, 80, 150, 50, 8);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.strokeRoundedRect(25, 80, 150, 50, 8);
    panel.add(buttonBg);

    const buttonText = this.add.text(100, 105, 'ROLL DICE', {
      font: 'bold 16px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);
    panel.add(buttonText);

    // Make button interactive
    const buttonZone = this.add.zone(100, 105, 150, 50)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    buttonZone.on('pointerdown', () => this.rollDice());
    buttonZone.on('pointerover', () => buttonBg.clear().fillStyle(0x00ff00, 1).fillRoundedRect(25, 80, 150, 50, 8).lineStyle(2, 0xffffff, 1).strokeRoundedRect(25, 80, 150, 50, 8));
    buttonZone.on('pointerout', () => buttonBg.clear().fillStyle(0x00aa00, 1).fillRoundedRect(25, 80, 150, 50, 8).lineStyle(2, 0xffffff, 1).strokeRoundedRect(25, 80, 150, 50, 8));

    panel.add(buttonZone);

    // Store references
    panel.diceText = diceText;
    panel.buttonBg = buttonBg;
    panel.buttonText = buttonText;
    panel.buttonZone = buttonZone;

    panel.setVisible(false); // Hidden until gameplay phase
    return panel;
  }

  /**
   * Create hunter selection panel
   */
  createHunterSelectionPanel() {
    const panel = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
    panel.setDepth(2000);

    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-GAME_CONFIG.width / 2, -GAME_CONFIG.height / 2, GAME_CONFIG.width, GAME_CONFIG.height);
    panel.add(overlay);

    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a1a, 1);
    panelBg.fillRoundedRect(-400, -250, 800, 500, 15);
    panelBg.lineStyle(4, 0xffaa00, 1);
    panelBg.strokeRoundedRect(-400, -250, 800, 500, 15);
    panel.add(panelBg);

    // Title
    const title = this.add.text(0, -210, 'CHOOSE YOUR HUNTER', {
      font: 'bold 32px monospace',
      fill: '#ffaa00'
    }).setOrigin(0.5);
    panel.add(title);

    // Player indicator
    panel.playerText = this.add.text(0, -170, 'PLAYER 1', {
      font: 'bold 24px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);
    panel.add(panel.playerText);

    // Hunter cards
    const hunters = ['zahra', 'andromeda', 'nox', 'lugh'];
    const hunterNames = ['ZAHRA\n(Silverbacks)', 'ANDROMEDA\n(Tyrants)', 'NOX\n(Reapers)', 'LUGH\n(Goblins)'];
    panel.hunterCards = [];

    hunters.forEach((hunter, index) => {
      const x = -300 + index * 200;
      const y = 0;

      // Card background
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x2a2a2a, 1);
      cardBg.fillRoundedRect(x - 75, y - 110, 150, 200, 10);
      cardBg.lineStyle(3, 0x555555, 1);
      cardBg.strokeRoundedRect(x - 75, y - 110, 150, 200, 10);
      panel.add(cardBg);

      // Hunter sprite
      const sprite = this.add.image(x, y - 30, hunter).setScale(0.4);
      panel.add(sprite);

      // Hunter name
      const nameText = this.add.text(x, y + 70, hunterNames[index], {
        font: 'bold 12px monospace',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      panel.add(nameText);

      // Interactive zone
      const cardZone = this.add.zone(x, y, 150, 200)
        .setInteractive({ useHandCursor: true });

      cardZone.on('pointerdown', () => this.selectHunter(hunter));
      cardZone.on('pointerover', () => {
        cardBg.clear();
        cardBg.fillStyle(0x3a3a3a, 1);
        cardBg.fillRoundedRect(x - 75, y - 110, 150, 200, 10);
        cardBg.lineStyle(3, 0xffaa00, 1);
        cardBg.strokeRoundedRect(x - 75, y - 110, 150, 200, 10);
      });
      cardZone.on('pointerout', () => {
        cardBg.clear();
        cardBg.fillStyle(0x2a2a2a, 1);
        cardBg.fillRoundedRect(x - 75, y - 110, 150, 200, 10);
        cardBg.lineStyle(3, 0x555555, 1);
        cardBg.strokeRoundedRect(x - 75, y - 110, 150, 200, 10);
      });

      panel.add(cardZone);
      panel.hunterCards.push({ hunter, cardBg, sprite, nameText, cardZone, x, y });
    });

    return panel;
  }

  /**
   * Select a hunter for the current player
   */
  selectHunter(hunterType) {
    const player = this.gameState.currentPlayer;
    this.gameState.players[player].hunter = hunterType;

    console.log(`Player ${player} selected ${hunterType}`);

    // Check if both players have selected
    if (player === 1) {
      // Switch to player 2
      this.gameState.currentPlayer = 2;
      this.hunterSelectionPanel.playerText.setText('PLAYER 2');
    } else {
      // Both players selected, move to placement phase
      this.gameState.phase = 'placement';
      this.gameState.currentPlayer = 1;
      this.hunterSelectionPanel.setVisible(false);
      this.placeHuntersOnBoard();
    }
  }

  /**
   * Place hunters on the board at starting positions
   */
  placeHuntersOnBoard() {
    // Player 1 starts at bottom-left area
    const p1Position = { q: -5, r: 5 };
    this.gameState.players[1].position = p1Position;

    const p1Pos = this.hexGrid.axialToPixel(p1Position.q, p1Position.r);
    this.gameState.players[1].hunterSprite = this.add.image(
      p1Pos.x,
      p1Pos.y,
      this.gameState.players[1].hunter
    ).setScale(0.15).setDepth(100);

    // Player 2 starts at top-right area
    const p2Position = { q: 5, r: -5 };
    this.gameState.players[2].position = p2Position;

    const p2Pos = this.hexGrid.axialToPixel(p2Position.q, p2Position.r);
    this.gameState.players[2].hunterSprite = this.add.image(
      p2Pos.x,
      p2Pos.y,
      this.gameState.players[2].hunter
    ).setScale(0.15).setDepth(100);

    // Move to playing phase
    this.gameState.phase = 'playing';
    this.dicePanel.setVisible(true);
    this.updateUI();

    console.log('Hunters placed on board. Game starting!');
  }

  /**
   * Roll the dice
   */
  rollDice() {
    if (this.gameState.remainingMoves > 0) {
      console.log('Finish your moves before rolling again!');
      return;
    }

    // Roll d6
    const roll = Phaser.Math.Between(1, 6);
    this.gameState.diceRoll = roll;
    this.gameState.remainingMoves = roll;

    // Animate dice
    this.dicePanel.diceText.setText(roll.toString());

    // Apply Zahra's passive (25% chance +1 movement)
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (currentPlayer.hunter === 'zahra' && Math.random() < 0.25) {
      this.gameState.remainingMoves += 1;
      console.log('Zahra\'s passive triggered! +1 movement');
    }

    console.log(`Player ${this.gameState.currentPlayer} rolled ${roll}, has ${this.gameState.remainingMoves} moves`);
    this.updateUI();
  }

  /**
   * Update UI based on current game state
   */
  updateUI() {
    // Update phase text
    if (this.gameState.phase === 'hunterSelection') {
      this.phaseText.setText('SELECT YOUR HUNTER');
      this.hunterSelectionPanel.setVisible(true);
    } else if (this.gameState.phase === 'placement') {
      this.phaseText.setText('PLACING HUNTERS...');
    } else if (this.gameState.phase === 'playing') {
      this.phaseText.setText(`PLAYER ${this.gameState.currentPlayer}'S TURN`);
      this.hunterSelectionPanel.setVisible(false);
    }

    // Update player info
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    let infoText = `PLAYER ${this.gameState.currentPlayer}\n`;
    infoText += `Hunter: ${currentPlayer.hunter || 'None'}\n`;
    infoText += `\nDice Roll: ${this.gameState.diceRoll || '-'}\n`;
    infoText += `Moves Left: ${this.gameState.remainingMoves}\n`;

    if (currentPlayer.position) {
      infoText += `\nPosition: (${currentPlayer.position.q}, ${currentPlayer.position.r})`;
    }

    this.playerInfoText.setText(infoText);
  }

  /**
   * Initialize and place structures
   */
  initializeStructures() {
    // P1 Structures (Left side)
    const p1Structures = [
      { type: 'pulseCannon', q: -8, r: 8 },
      { type: 'fightingPits', q: -7, r: 6 },
      { type: 'swarmPortal', q: -6, r: 4 },
      { type: 'ammoVein', q: -8, r: 4 },
      { type: 'swarmMother', q: -9, r: 6 },
      { type: 'gateKeeper', q: -7, r: 8 }
    ];

    p1Structures.forEach(struct => {
      this.placeStructure(1, struct.type, struct.q, struct.r);
    });

    // P2 Structures (Right side) - Mirrored
    const p2Structures = [
      { type: 'pulseCannon', q: 8, r: -8 },
      { type: 'fightingPits', q: 7, r: -6 },
      { type: 'swarmPortal', q: 6, r: -4 },
      { type: 'ammoVein', q: 8, r: -4 },
      { type: 'swarmMother', q: 9, r: -6 },
      { type: 'gateKeeper', q: 7, r: -8 }
    ];

    p2Structures.forEach(struct => {
      this.placeStructure(2, struct.type, struct.q, struct.r);
    });

    // Neutral Structures
    this.add.image(GAME_CONFIG.width / 2, 100, 'temple').setScale(0.3).setDepth(50); // Temple (Top Center)
    this.add.image(GAME_CONFIG.width / 2, GAME_CONFIG.height - 100, 'barracks').setScale(0.3).setDepth(50); // Barracks (Bottom Center)
  }

  placeStructure(playerId, type, q, r) {
    const config = STRUCTURE_CONFIG[type];
    const pos = this.hexGrid.axialToPixel(q, r);

    // Create visual sprite
    const sprite = this.add.image(pos.x, pos.y, type.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).setScale(0.15).setDepth(50);

    // Create state object
    const structureState = {
      id: `${type}_${playerId}`,
      type: type,
      name: config.name,
      hp: config.hp,
      maxHp: config.hp,
      position: { q, r },
      sprite: sprite,
      owner: playerId
    };

    // Add HP bar
    this.createHealthBar(structureState);

    this.gameState.players[playerId].structures[type] = structureState;
  }

  createHealthBar(entity) {
    const x = entity.sprite.x - 20;
    const y = entity.sprite.y - 30;

    const bg = this.add.graphics().setDepth(51);
    bg.fillStyle(0x000000, 1);
    bg.fillRect(x, y, 40, 6);

    const bar = this.add.graphics().setDepth(52);
    this.updateHealthBar(bar, x, y, entity.hp, entity.maxHp);

    entity.healthBar = bar;
    entity.healthBg = bg;
  }

  updateHealthBar(graphics, x, y, hp, maxHp) {
    graphics.clear();
    const percent = Math.max(0, hp / maxHp);
    const color = percent > 0.5 ? 0x00ff00 : (percent > 0.25 ? 0xffff00 : 0xff0000);

    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, 40 * percent, 6);
  }

  /**
   * Initialize Stranglethorn barriers
   */
  initializeStranglethorns() {
    // 5 tiers in the middle column (q=0)
    for (let r = -2; r <= 2; r++) {
      const tierIdx = r + 2; // 0 to 4
      const tierConfig = STRANGLETHORN_CONFIG.tiers[tierIdx];

      const pos = this.hexGrid.axialToPixel(0, r);

      // Create sprite (scale based on tier)
      const sprite = this.add.image(pos.x, pos.y, 'stranglethorn_base')
        .setScale(0.15 + (tierIdx * 0.02))
        .setTint(0xffffff - (tierIdx * 0x202020)) // Darker for higher tiers
        .setDepth(60);

      const barrier = {
        tier: tierIdx + 1,
        hp: tierConfig.hp,
        maxHp: tierConfig.hp,
        defense: tierConfig.defense,
        position: { q: 0, r: r },
        sprite: sprite
      };

      this.createHealthBar(barrier);
      this.gameState.stranglethorns.push(barrier);
    }
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
   * Set up mouse interactivity for hex selection and movement
   */
  setupInteractivity() {
    this.input.on('pointermove', (pointer) => {
      if (this.gameState.phase !== 'playing') return;

      const axial = this.hexGrid.pixelToAxial(pointer.x, pointer.y);

      // Check if hovering over a new hex
      if (!this.hoveredHex || this.hoveredHex.q !== axial.q || this.hoveredHex.r !== axial.r) {
        this.hoveredHex = axial;
        this.updateHighlight();
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.gameState.phase !== 'playing') return;

      const axial = this.hexGrid.pixelToAxial(pointer.x, pointer.y);
      this.selectedHex = axial;

      // Try to move hunter to clicked hex
      this.moveHunter(axial);

      this.updateHighlight();
    });
  }

  /**
   * Move current player's hunter to target hex
   */
  moveHunter(targetHex) {
    if (this.gameState.remainingMoves <= 0) {
      console.log('No moves remaining! Roll the dice.');
      return;
    }

    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    const currentPos = currentPlayer.position;

    // Calculate distance
    const distance = this.hexGrid.distance(
      currentPos.q,
      currentPos.r,
      targetHex.q,
      targetHex.r
    );

    // Check if move is valid (adjacent hex only for now)
    if (distance !== 1) {
      console.log('Can only move to adjacent hexes!');
      return;
    }

    // Check if we have enough moves
    if (distance > this.gameState.remainingMoves) {
      console.log('Not enough moves!');
      return;
    }

    // Move hunter
    currentPlayer.position = { q: targetHex.q, r: targetHex.r };
    const newPos = this.hexGrid.axialToPixel(targetHex.q, targetHex.r);

    // Animate movement
    this.tweens.add({
      targets: currentPlayer.hunterSprite,
      x: newPos.x,
      y: newPos.y,
      duration: 300,
      ease: 'Power2'
    });

    // Deduct move
    this.gameState.remainingMoves -= distance;

    console.log(`Moved to (${targetHex.q}, ${targetHex.r}). ${this.gameState.remainingMoves} moves left.`);
    this.updateUI();

    // Auto end turn if no moves left
    if (this.gameState.remainingMoves === 0) {
      this.time.delayedCall(500, () => {
        this.showEndTurnPrompt();
      });
    }
  }

  /**
   * Show end turn prompt
   */
  showEndTurnPrompt() {
    // For now, just auto-switch turns
    // TODO: Add "End Turn" button in future
    this.endTurn();
  }

  /**
   * End current player's turn
   */
  endTurn() {
    console.log(`Player ${this.gameState.currentPlayer} ended their turn`);

    // Switch players
    this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
    this.gameState.diceRoll = null;
    this.gameState.remainingMoves = 0;
    this.dicePanel.diceText.setText('?');

    this.updateUI();
    console.log(`Player ${this.gameState.currentPlayer}'s turn`);
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

  update() {
    // Game loop updates will go here
  }
}
