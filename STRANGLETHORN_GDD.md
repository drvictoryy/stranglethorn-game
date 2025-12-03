# STRANGLETHORN - Game Design Document (GDD)
## Technical Implementation Guide for Claude Code

**Version:** Beta v1.0  
**Last Updated:** December 3, 2025  
**Tech Stack:** Phaser.js 3, Pixel Art Aesthetic  
**Target:** Hot-seat multiplayer, hex-based tactical board game

---

## TABLE OF CONTENTS
1. [Game Overview](#game-overview)
2. [Core Mechanics](#core-mechanics)
3. [Asset Inventory](#asset-inventory)
4. [Game State Architecture](#game-state-architecture)
5. [Hex Grid System](#hex-grid-system)
6. [Combat System](#combat-system)
7. [Economy & Progression](#economy-progression)
8. [Structure Mechanics](#structure-mechanics)
9. [UI Requirements](#ui-requirements)
10. [Implementation Phases](#implementation-phases)

---

## GAME OVERVIEW

### Concept
Stranglethorn is a strategic 1v1 hex-based board game where players control Hunters battling for supremacy. Victory is achieved by either reducing the opponent's Hunter to 0 HP or destroying all 6 of their structures.

### Core Loop
1. Roll 6-sided die for movement
2. Navigate hex grid to collect resources (Thorns currency)
3. Fight NPCs to level up Hunter (Level 1 → 2 → 3)
4. Purchase weapons at Barracks
5. Defeat 5-tier Stranglethorn barrier to access enemy territory
6. Attack enemy structures or Hunter directly
7. First to eliminate opponent wins

### Design Pillars
- **Strategic Depth:** Every decision matters (resource vs combat, timing, positioning)
- **Risk/Reward:** Balance aggression with defensive positioning
- **Build Diversity:** Multiple viable paths to victory (rush, economic, minion swarm)

---

## CORE MECHANICS

### Movement System
- **Die Roll:** Each turn, roll 1d6 to determine available movement points
- **Hex Traversal:** Each hex tile costs 1 movement point
- **Movement Splitting:** Can split movement between Hunter and controlled minions
- **Pack Movement:** Adjacent Swarmlings can move as a group (costs 1 move total)
- **Structure Interaction:** Can only interact with structures from orange-perimeter tiles. Interacting does NOT cost movement points.

### Turn Structure
```
1. Roll Phase: Roll d6, display result
2. Movement Phase: Player allocates movement points
3. Action Phase: Attack OR interact with structure (one action per turn)
4. End Turn: Check victory conditions, switch active player
```

### Combat Rules
- **Attack Calculation:** `Damage = max(0, Attacker.Attack - Defender.Defense)`
- **Hunter vs Structure:** Hunter deals ½ normal damage to structures
- **Structure HP:** 1 Unit = 10 HP for Hunter attacks
- **Attack Limit:** One attack per turn per entity (but Hunter + minions can all attack in same turn)
- **Combined Attack Option:** Can sum all adjacent friendly units' attack points when attacking (coordinate strike)
- **Combat Consumption:** Attacking costs 1 movement point

### Victory Conditions
- **Win Condition 1:** Reduce enemy Hunter to 0 HP
- **Win Condition 2:** Destroy all 6 enemy structures

---

## ASSET INVENTORY

### Hunters (Playable Characters)
**Beta v1.0 includes 4 Hunters:**

| Hunter | Race | Stats (Level 1) | Description |
|--------|------|-----------------|-------------|
| Zahra | Silverbacks | Atk 10, Def 10, HP 50 | Massive gorilla warrior, black fur with pink/purple splotches |
| Andromeda | Tyrants | Atk 10, Def 10, HP 50 | Human female, dark armor, cold-blooded killer |
| Nox | Reapers | Atk 10, Def 10, HP 50 | Demonic skull warrior with flame sword |
| Lugh | Goblins | Atk 10, Def 10, HP 50 | Rogue goblin, broke servitude programming |

**Hunter Progression:**
- Level 1: Attack 10, Defense 10, HP 50
- Level 2: Attack 20, Defense 20, HP 50 (unlock after 3 Fighting Pits wins, +2 Thorns bonus)
- Level 3: Attack 30, Defense 30, HP 50 (unlock after 8 Fighting Pits wins, +2 Thorns bonus)

**Hunter Passive Abilities:**

| Hunter | Race | Passive Ability |
|--------|------|-----------------|
| Zahra | Silverbacks | **Primal Surge:** 25% chance to gain +1 movement point on dice roll |
| Andromeda | Tyrants | **Blood Sacrifice:** Heal 5 HP when killing an enemy minion OR sacrifice one of your own minions to heal 5 HP (once per turn) |
| Nox | Reapers | **Weapon Mastery:** Double the attack bonus from melee weapons (excludes Predator Missiles and Shield of Abomination) |
| Lugh | Goblins | **Thrifty:** Earn +1 Thorn whenever you gain Thorns from any source |

**Melee Weapons (affected by Nox's passive):**
- Brutal Axe of Hildoune: +5 → +10 attack for Nox
- Ancient Elder's Staff: +10 → +20 attack for Nox
- Jaxis War Flail: +15 → +30 attack for Nox
- Hanzo Katana: +15 → +30 attack for Nox
- Vipers: +20 → +40 attack for Nox

**Implementation:**
```javascript
function applyHunterPassive(player, trigger, context = {}) {
  switch(player.hunter.type) {
    case 'zahra':
      if (trigger === 'dice_roll' && Math.random() < 0.25) {
        context.movementBonus = 1;
        showNotification(`Zahra's Primal Surge! +1 movement`);
      }
      break;
    
    case 'andromeda':
      if (trigger === 'minion_killed' && !player.usedBloodSacrifice) {
        player.hunter.hp = Math.min(player.hunter.hp + 5, player.hunter.maxHp);
        player.usedBloodSacrifice = true;
        showNotification(`Andromeda's Blood Sacrifice! +5 HP`);
      } else if (trigger === 'sacrifice_own_minion' && !player.usedBloodSacrifice) {
        const minion = context.minionToSacrifice;
        removeMinion(player, minion);
        player.hunter.hp = Math.min(player.hunter.hp + 5, player.hunter.maxHp);
        player.usedBloodSacrifice = true;
        showNotification(`Andromeda sacrifices a minion! +5 HP`);
      }
      break;
    
    case 'nox':
      if (trigger === 'equip_weapon') {
        const weapon = context.weapon;
        const meleeWeapons = [
          'brutal_axe', 'elders_staff', 'war_flail', 
          'hanzo_katana', 'vipers'
        ];
        
        if (meleeWeapons.includes(weapon.id)) {
          weapon.attackBonus *= 2; // Double the attack bonus
          showNotification(`Nox's Weapon Mastery! Attack bonus doubled`);
        }
      }
      break;
    
    case 'lugh':
      if (trigger === 'thorns' && context.thornsEarned > 0) {
        player.resources.thorns += 1;
        showNotification(`Lugh's Thrifty! +1 bonus Thorn`);
      }
      break;
  }
}

// Calculate Hunter's total attack including weapon bonuses
function getHunterAttack(hunter) {
  let attack = hunter.baseAttack; // 10/20/30 based on level
  
  if (hunter.equippedWeapon) {
    let weaponBonus = hunter.equippedWeapon.attackBonus;
    
    // Nox's passive already doubled the bonus when equipped
    attack += weaponBonus;
  }
  
  return attack;
}

// Reset Andromeda's passive at start of turn
function startTurn(player) {
  if (player.hunter.type === 'andromeda') {
    player.usedBloodSacrifice = false;
  }
  // ... other turn start logic
}
```

**File Locations:**
- `/assets/sprites/hunters/zahra.png` (256x256)
- `/assets/sprites/hunters/andromeda.png` (256x256)
- `/assets/sprites/hunters/nox.png` (256x256)
- `/assets/sprites/hunters/lugh.png` (256x256)

### Minions (Controllable Units)

| Minion | Attack | Defense | HP | Respawn | Notes |
|--------|--------|---------|----|---------| ------|
| Swarmling | 3 | 0 | 3 | Yes (2 turns) | Spawned from Swarm Portal, max 9 |
| Ravager | 25 | 10 | 10 | No | Captured from Fighting Pits |
| Hellspawn (Abomination) | 30 | 30 | 50 | No | Boss-tier unit, rare capture |

**File Locations:**
- `/assets/sprites/minions/swarmling.png` (256x256)
- `/assets/sprites/minions/ravager.png` (256x256)
- `/assets/sprites/minions/hellspawn.png` (256x256)

### Structures (6 per player)

| Structure | Function | Units (HP) | Cooldown |
|-----------|----------|------------|----------|
| Pulse Cannon | Load ammo to deal 1 damage to target enemy structure | 5 Units | Requires ammo |
| Fighting Pits | Battle NPCs for Thorns & levels. Roll d20 for encounter | 9 Units | 1 turn if failed |
| Swarm Portal | Spawn Swarmling every 3 turns | 6 Units | 3 turns |
| Ammo Vein | Collect 1 ammo (max 3 held) | 3 Units | Every other turn |
| Swarm Mother | Boss: Atk 10, Def 5, HP 5. Drops 2 Thorns | 3 Units | Respawns every 3 turns |
| GateKeeper | Boss: Atk 12, Def 0, HP 10. Drops 5 Thorns | 4 Units | Respawns every 3 turns |

**File Locations:**
- `/assets/sprites/structures/pulse_cannon.png` (256x256)
- `/assets/sprites/structures/fighting_pits.png` (256x256)
- `/assets/sprites/structures/swarm_portal.png` (256x256)
- `/assets/sprites/structures/ammo_vein.png` (256x256)
- `/assets/sprites/structures/swarm_mother.png` (256x256)
- `/assets/sprites/structures/gatekeeper.png` (256x256)

### Neutral Structures (Shared)

| Structure | Function | Size |
|-----------|----------|------|
| Temple of Sacrifice | Sacrifice Swarmlings for Souls. 10 Souls = control Roog | 432x256 (16:9) |
| Barracks | Purchase weapons (9-15 Thorns) and equipment | 432x256 (16:9) |

**File Locations:**
- `/assets/sprites/structures/temple.png` (432x256)
- `/assets/sprites/structures/barracks.png` (432x256)

### Stranglethorns (Progression Gates)

**5 tiers blocking access to enemy territory. Must defeat all 5 to cross.**

| Tier | Defense | HP | Visual |
|------|---------|----|----|
| T1 | 5 | 5 | Thin vines |
| T2 | 10 | 10 | Thicker vines |
| T3 | 15 | 15 | Dense barrier |
| T4 | 20 | 20 | Very thick |
| T5 | 25 | 25 | Massive wall |

**Implementation:** Use 1 base sprite with progressive scaling/darkening to show tier

**File Location:**
- `/assets/sprites/stranglethorns/base.png` (256x256)
- Scale/tint at runtime for tiers 2-5

### Board
- **File Location:** `/assets/board/stranglethorn_board.png`
- **Hex Grid:** Overlaid programmatically in Phaser
- **Color Scheme:** Dark greens, oranges, blacks, bone whites

---

## GAME STATE ARCHITECTURE

### Global Game State
```javascript
{
  currentPlayer: 1 | 2,
  turnCount: number,
  winner: null | 1 | 2,
  
  players: {
    1: PlayerState,
    2: PlayerState
  },
  
  board: {
    hexGrid: HexCell[][],
    stranglethorns: StranglethornState[],
    neutralStructures: {
      temple: TempleState,
      barracks: BarracksState
    }
  },
  
  dice: {
    lastRoll: number,
    remainingMoves: number
  }
}
```

### Player State
```javascript
{
  id: 1 | 2,
  hunter: {
    type: 'zahra' | 'andromeda' | 'nox' | 'lugh',
    level: 1 | 2 | 3,
    hp: number,
    maxHp: 50,
    attack: number, // 10, 20, or 30 based on level
    defense: number, // 10, 20, or 30 based on level
    position: HexCoordinates,
    equippedWeapon: Weapon | null,
    fightingPitsWins: number // Track for level ups
  },
  
  resources: {
    thorns: number,
    ammo: number, // Max 3
    souls: number
  },
  
  structures: {
    pulseCannon: StructureState,
    fightingPits: StructureState,
    swarmPortal: StructureState,
    ammoVein: StructureState,
    swarmMother: StructureState,
    gateKeeper: StructureState
  },
  
  minions: {
    swarmlings: Minion[],
    ravagers: Minion[],
    hellspawns: Minion[]
  }
}
```

### Structure State
```javascript
{
  type: string,
  hp: number,
  maxHp: number,
  position: HexCoordinates,
  destroyed: boolean,
  cooldown: number, // Turns until next use
  active: boolean
}
```

### Minion State
```javascript
{
  type: 'swarmling' | 'ravager' | 'hellspawn',
  attack: number,
  defense: number,
  hp: number,
  maxHp: number,
  position: HexCoordinates,
  respawnTimer: number | null, // Only for Swarmlings
  ownedBy: 1 | 2
}
```

---

## HEX GRID SYSTEM

### Coordinate System
Use **axial coordinates** for hex grid:
```javascript
{
  q: number, // column
  r: number  // row
}
```

### Hex Grid Layout
- **Orientation:** Flat-top hexagons
- **Grid Dimensions:** Determined by board image (estimate ~15 columns x 20 rows)
- **Hex Size:** ~40-50px radius (adjust to fit board)

### Hex Cell Properties
```javascript
{
  coordinates: { q: number, r: number },
  type: 'path' | 'structure' | 'blocked',
  occupant: Hunter | Minion | null,
  structure: Structure | null,
  isOrangePerimeter: boolean, // Can interact with structures from here
  territory: 'neutral' | 'player1' | 'player2'
}
```

### Movement Validation
```javascript
function isValidMove(from: HexCoord, to: HexCoord, movesRemaining: number): boolean {
  // Check path distance
  const distance = hexDistance(from, to);
  if (distance > movesRemaining) return false;
  
  // Check if destination is occupied
  if (getHexCell(to).occupant !== null) return false;
  
  // Check if Stranglethorn barrier blocks path
  if (crossesStranglethornBarrier(from, to) && !allStranglethornsDefeated()) {
    return false;
  }
  
  return true;
}
```

### Pathfinding
Implement A* pathfinding for hex grid:
- Use axial coordinates
- Calculate hex distance: `Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((q1 + r1) - (q2 + r2)) / 2`
- Highlight valid move range when unit selected

---

## COMBAT SYSTEM

### Damage Calculation
```javascript
function calculateDamage(attacker, defender, isStructure = false): number {
  let damage = Math.max(0, attacker.attack - defender.defense);
  
  // Hunter vs Structure: deal ½ damage
  if (attacker.type === 'hunter' && isStructure) {
    damage = Math.floor(damage / 2);
  }
  
  // Structure HP: 1 Unit = 10 HP for Hunter attacks
  if (attacker.type === 'hunter' && isStructure) {
    damage = damage * 10; // Convert to structure damage scale
  }
  
  return damage;
}
```

### Fighting Pits Mechanic
```javascript
function enterFightingPits(player: Player): void {
  const d20Roll = rollDice(20);
  
  let enemy = null;
  if (d20Roll <= 16) {
    enemy = { type: 'swarmling', attack: 3, defense: 0, hp: 3 };
  } else if (d20Roll <= 19) {
    enemy = { type: 'ravager', attack: 25, defense: 10, hp: 10 };
  } else { // d20Roll === 20
    enemy = { type: 'abomination', attack: 30, defense: 30, hp: 50 };
  }
  
  // Resolve combat
  const result = resolveCombat(player.hunter, enemy);
  
  if (result === 'win') {
    // Award Thorns
    if (enemy.type === 'ravager') player.resources.thorns += 3;
    else if (enemy.type === 'abomination') player.resources.thorns += 5;
    else player.resources.thorns += 1;
    
    // Apply Hunter passive ability
    applyHunterPassive(player, 'thorns');
    
    // Track wins for leveling
    player.hunter.fightingPitsWins++;
    
    // Check for level up
    if (player.hunter.fightingPitsWins === 3 && player.hunter.level === 1) {
      levelUpHunter(player, 2);
      player.resources.thorns += 2; // Bonus Thorns
    } else if (player.hunter.fightingPitsWins === 8 && player.hunter.level === 2) {
      levelUpHunter(player, 3);
      player.resources.thorns += 2; // Bonus Thorns
    }
    
    // Can fight again this turn
    player.canFightAgain = true;
  } else {
    // Lost: 1 turn cooldown on Fighting Pits
    player.structures.fightingPits.cooldown = 1;
  }
}
```

### Boss Respawn Timers
- **Swarm Mother:** 3-turn respawn after defeat
- **GateKeeper:** 3-turn respawn after defeat

---

## ECONOMY & PROGRESSION

### Thorn Economy
**Earning Thorns:**
- Fighting Pits wins: 1-3 Thorns (based on enemy)
- Swarm Mother defeat: 2 Thorns
- GateKeeper defeat: 5 Thorns
- Level up bonuses: 1-2 Thorns

**Spending Thorns:**
- Weapons: 9 Thorns (standard) or 15 Thorns (special)
- UDAS: 8-20 Thorns
- Special Equipment: 3-25 Thorns

### Weapons (Barracks)

| Weapon | Attack | Defense | Cost | Special |
|--------|--------|---------|------|---------|
| Brutal Axe of Hildoune | +5 | +15 | 9 | - |
| Ancient Elder's Staff | +10 | +10 | 9 | - |
| Jaxis War Flail | +15 | +5 | 9 | - |
| Hanzo Katana | +15 | +5 | 9 | - |
| Vipers | +20 | +0 | 9 | Glass cannon |
| Predator Missiles | +20 | +0 | 15 | Attack 3 adjacent tiles |
| Shield of Abomination | +5 | +20 | 15 | Empower Swarmlings +3 HP |

**Rules:**
- Each weapon has stock of 1
- Can return weapon for no refund and buy new one
- Only 1 weapon equipped at a time

### Soul System (Temple of Sacrifice)
- Sacrifice Swarmlings: 1 Swarmling = 1 Soul (automatically added to your soul count, no need to visit Temple)
- First player to reach 10 Souls controls Roog
- **Roog:** Can destroy 1 target enemy structure once per turn (not every other turn)
- Roog is a powerful unit under your control once summoned

---

## STRUCTURE MECHANICS

### Pulse Cannon
- Requires ammo (collected from Ammo Vein)
- Costs 1 ammo to fire
- Deals 1 damage to target enemy structure
- No cooldown (limited by ammo availability)

### Swarm Portal
- Spawns 1 Swarmling every 3 turns
- Maximum 9 Swarmlings per player
- Once initiated, runs automatically

### Pack Movement System
**Pack Movement Rules:**
- **Swarmling Packs:** Adjacent Swarmlings (touching hexes) can move together as a single group
- **Hunter Formation:** Any minions adjacent to your Hunter can move with the Hunter as a pack
- Moving a pack costs 1 movement point total (not 1 per unit)
- All units in pack must move to adjacent destination hexes (maintain formation relative to Hunter)
- Can split packs or merge them during movement phase

**Implementation:**
```javascript
function getAdjacentUnits(leader, allUnits) {
  const adjacent = [];
  const neighbors = leader.position.neighbors();
  
  for (const neighbor of neighbors) {
    const found = allUnits.find(u => 
      u.position.q === neighbor.q && 
      u.position.r === neighbor.r &&
      u.ownedBy === leader.ownedBy
    );
    if (found) adjacent.push(found);
  }
  
  return adjacent;
}

function movePackWithLeader(leader, destination, allUnits) {
  // Find all units adjacent to leader (Swarmlings, Ravagers, Hellspawns)
  const pack = getAdjacentUnits(leader, allUnits);
  
  // Calculate offset from leader to destination
  const offset = {
    q: destination.q - leader.position.q,
    r: destination.r - leader.position.r
  };
  
  // Move leader
  leader.position.q = destination.q;
  leader.position.r = destination.r;
  
  // Move all pack members maintaining formation
  pack.forEach(unit => {
    unit.position.q += offset.q;
    unit.position.r += offset.r;
  });
  
  return 1; // Cost 1 movement point for entire pack (Hunter + minions)
}

// Swarmling-only packs (when Hunter not involved)
function moveSwarmlingPack(packLeader, destination, allSwarmlings) {
  const pack = getConnectedSwarmlings(packLeader, allSwarmlings);
  
  const offset = {
    q: destination.q - packLeader.position.q,
    r: destination.r - packLeader.position.r
  };
  
  pack.forEach(swarmling => {
    swarmling.position.q += offset.q;
    swarmling.position.r += offset.r;
  });
  
  return 1; // Cost 1 movement point for Swarmling pack
}
```

### Combined Attack System
**Coordinate Strike Mechanic:**
- When attacking, player can choose to combine attack power of adjacent friendly units
- All participating units must be on hexes adjacent to the target
- Sum all attack values, then apply defender's defense once
- Example: Hunter (Atk 20) + 2 Swarmlings (Atk 3 each) = 26 total attack vs target defense
- Useful for overwhelming high-defense targets

**Implementation:**
```javascript
function getCombinedAttackOptions(target, attackingPlayer) {
  const adjacentToTarget = target.position.neighbors();
  const availableAttackers = [];
  
  // Find all friendly units adjacent to target
  for (const hex of adjacentToTarget) {
    const unit = getUnitAtPosition(hex, attackingPlayer);
    if (unit && !unit.hasAttacked) {
      availableAttackers.push(unit);
    }
  }
  
  return availableAttackers;
}

function executeCombinedAttack(attackers, target) {
  const totalAttack = attackers.reduce((sum, unit) => sum + unit.attack, 0);
  const damage = Math.max(0, totalAttack - target.defense);
  
  target.hp -= damage;
  
  // Mark all attackers as having attacked this turn
  attackers.forEach(unit => unit.hasAttacked = true);
  
  return damage;
}
```

### Ammo Vein
- Collect 1 ammo per visit
- 1-turn cooldown (every other turn)
- Max 3 ammo held at once

---

## UI REQUIREMENTS

### HUD Elements
**Top Bar:**
- Current Player indicator (P1 Orange / P2 Brown)
- Turn counter
- Phase indicator (Roll / Move / Action)

**Player Resources (per side):**
- Hunter HP bar with numerical value
- Thorns count (currency icon + number)
- Ammo count (bullet icon + number, max 3)
- Souls count (if applicable)
- Structure health indicators (6 mini icons showing HP)

**Center Display:**
- Dice roll animation and result
- Movement points remaining
- Current action context ("Select movement destination", "Choose attack target", etc.)

**Bottom Panel:**
- Selected unit info (stats, equipped weapon)
- Available actions (Move, Attack, Use Structure, End Turn)
- Quick reference for controls

### Visual Feedback
- **Hover:** Hex tiles light up on mouseover
- **Valid Moves:** Green highlight for reachable hexes
- **Attack Range:** Red highlight for attackable targets
- **Selected Unit:** Orange glow around active unit
- **Structure Status:** HP bars above structures
- **Damage Numbers:** Float up from damaged units/structures

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1, Days 1-3)
**Goal:** Playable board with movement

**Tasks:**
1. Set up Phaser.js project structure
2. Load board image as base layer
3. Implement hex grid overlay system
4. Create HexCoordinates utility functions
5. Implement dice rolling UI with animation
6. Place Hunter sprites on starting positions
7. Implement click-to-move for Hunters
8. Movement validation and path highlighting
9. Turn system (Roll → Move → End Turn)
10. Basic UI: Player indicator, dice result, movement remaining

**Deliverables:**
- Players can roll dice and move Hunters around the board
- Turn alternates between players
- No combat yet, just navigation

### Phase 2: Combat & Structures (Week 1-2, Days 4-7)
**Goal:** Full combat system and structure interaction

**Tasks:**
1. Place all 12 structures (6 per player) on board
2. Implement structure HP tracking
3. Attack action: Hunter vs Structure
4. Attack action: Hunter vs Hunter
5. Damage calculation system
6. Visual feedback for combat (damage numbers, HP bars)
7. Stranglethorn barrier placement (5 tiers)
8. Stranglethorn combat and progression gate
9. Victory condition checks (HP = 0 or all structures destroyed)
10. Game over screen

**Deliverables:**
- Full combat system functional
- Can attack and destroy structures
- Stranglethorns block territory access
- Win conditions trigger properly

### Phase 3: Economy & Progression (Week 2, Days 8-10)
**Goal:** Thorn economy and Hunter leveling

**Tasks:**
1. Thorn counter and resource management
2. Fighting Pits interaction
   - d20 roll for encounter
   - Combat resolution
   - Thorn rewards
   - Win tracking for levels
3. Hunter leveling system (1 → 2 → 3)
4. Barracks interaction
   - Shop UI
   - Weapon purchasing
   - Weapon stat application
5. Ammo Vein interaction
6. Pulse Cannon firing mechanic
7. Swarm Mother & GateKeeper boss fights
8. Boss respawn timers

**Deliverables:**
- Full resource economy functional
- Players can level up and buy weapons
- All structure mechanics working

### Phase 4: Minions & Polish (Week 2-3, Days 11-14)
**Goal:** Minion system and final polish

**Tasks:**
1. Swarm Portal spawning system
2. Swarmling placement and movement
3. Minion combat (attacking with Hunter + minions same turn)
4. Swarmling respawn timers
5. Ravager/Hellspawn capture from Fighting Pits (simplified or stubbed)
6. Temple of Sacrifice soul system (basic implementation)
7. Sound effects (dice roll, combat, structure destruction)
8. Visual polish (animations, particle effects)
9. Mobile touch controls (if applicable)
10. Playtesting and bug fixes

**Deliverables:**
- Full minion system
- Complete gameplay loop
- Polished and playable beta

---

## TECHNICAL NOTES

### Phaser.js Setup
```javascript
const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#1a1a1a'
};

const game = new Phaser.Game(config);
```

### Asset Loading
```javascript
function preload() {
  // Board
  this.load.image('board', 'assets/board/stranglethorn_board.png');
  
  // Hunters
  this.load.image('zahra', 'assets/sprites/hunters/zahra.png');
  this.load.image('andromeda', 'assets/sprites/hunters/andromeda.png');
  this.load.image('nox', 'assets/sprites/hunters/nox.png');
  this.load.image('lugh', 'assets/sprites/hunters/lugh.png');
  
  // Minions
  this.load.image('swarmling', 'assets/sprites/minions/swarmling.png');
  this.load.image('ravager', 'assets/sprites/minions/ravager.png');
  this.load.image('hellspawn', 'assets/sprites/minions/hellspawn.png');
  
  // Structures (6 player + 2 neutral)
  this.load.image('pulse_cannon', 'assets/sprites/structures/pulse_cannon.png');
  this.load.image('fighting_pits', 'assets/sprites/structures/fighting_pits.png');
  this.load.image('swarm_portal', 'assets/sprites/structures/swarm_portal.png');
  this.load.image('ammo_vein', 'assets/sprites/structures/ammo_vein.png');
  this.load.image('swarm_mother', 'assets/sprites/structures/swarm_mother.png');
  this.load.image('gatekeeper', 'assets/sprites/structures/gatekeeper.png');
  this.load.image('temple', 'assets/sprites/structures/temple.png');
  this.load.image('barracks', 'assets/sprites/structures/barracks.png');
  
  // Stranglethorns
  this.load.image('stranglethorn', 'assets/sprites/stranglethorns/base.png');
}
```

### Hex Grid Utilities
```javascript
// Axial coordinate system
class HexCoord {
  constructor(q, r) {
    this.q = q;
    this.r = r;
  }
  
  // Convert axial to pixel coordinates
  toPixel(hexSize) {
    const x = hexSize * (3/2 * this.q);
    const y = hexSize * (Math.sqrt(3)/2 * this.q + Math.sqrt(3) * this.r);
    return { x, y };
  }
  
  // Calculate distance between hexes
  distanceTo(other) {
    return (Math.abs(this.q - other.q) + 
            Math.abs(this.r - other.r) + 
            Math.abs((this.q + this.r) - (other.q + other.r))) / 2;
  }
  
  // Get neighboring hexes
  neighbors() {
    const directions = [
      [+1, 0], [+1, -1], [0, -1],
      [-1, 0], [-1, +1], [0, +1]
    ];
    return directions.map(([dq, dr]) => 
      new HexCoord(this.q + dq, this.r + dr)
    );
  }
}
```

---

## APPENDIX: SIMPLIFIED MECHANICS FOR BETA

### Deferred to Post-Beta
These features can be stubbed or simplified for v1.0:

1. **Fighting Pits Capture:** Auto-defeat enemies for Thorns (skip trap capture mechanic for capturing minions)
2. **UDAS Purchases:** Stub out artillery strikes UI (not functional in beta)
3. **Special Equipment:** Only implement weapons for beta (no Carpet of Jubilation, Pegasus Wings, etc.)
4. **Advanced Animations:** Static sprites for beta (movement tweens post-beta)

### Critical Path for Beta
**Must Have:**
- Hex movement with dice rolling
- Hunter vs Hunter combat
- Hunter vs Structure combat
- Combined attack system (sum adjacent units' attack)
- Stranglethorn progression gate
- Fighting Pits for leveling
- Barracks weapon purchasing
- Resource economy (Thorns, Ammo)
- Swarm Portal spawning with pack movement
- Swarmling pack movement (adjacent Swarmlings move as group)
- Temple of Sacrifice soul collection and Roog summoning
- Hunter passive abilities
- Victory conditions

**Nice to Have (if time allows):**
- Minion combat
- Boss respawn timers
- Sound effects
- Combat animations

---

## CONTACT & ITERATION

This GDD is a living document. As implementation progresses in Claude Code, update this document with:
- Actual hex grid dimensions from board
- Precise structure placement coordinates
- Balance adjustments (damage values, costs, etc.)
- Bug fixes and edge cases discovered

**Key Files to Reference:**
- All sprite assets (once organized in `/assets/` directory)
- Board image (for hex grid overlay calibration)
- This GDD for game logic and rules

---

**END OF DOCUMENT**
