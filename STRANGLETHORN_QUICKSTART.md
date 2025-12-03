# STRANGLETHORN - Quick Start Guide for Claude Code
**Hex-Based Tactical Board Game | Phaser.js | Beta v1.0**

---

## GAME OVERVIEW
- **Type:** 1v1 strategic hex board game
- **Win Conditions:** Reduce enemy Hunter to 0 HP OR destroy all 6 enemy structures
- **Core Loop:** Roll dice → Move → Fight/Interact → End turn

## TURN STRUCTURE
1. Roll d6 for movement points
2. Move Hunter/minions (pack movement allowed)
3. One action: Attack OR interact with structure
4. End turn, switch players

## MOVEMENT RULES
- Each hex = 1 movement point
- **Pack Movement:** Hunter + adjacent minions move together (costs 1 move total)
- Swarmling packs can also move together
- Structure interaction does NOT cost movement

## COMBAT
- Damage = `max(0, Attack - Defense)`
- Hunter vs Structure: ½ damage
- **Combined Attack:** Sum adjacent units' attack vs single target
- One attack per entity per turn (but multiple entities can attack)

## HUNTERS (4 available)
All start: Attack 10, Defense 10, HP 50

**Passives:**
- **Zahra (Silverbacks):** 25% chance +1 movement on roll
- **Andromeda (Tyrants):** Heal 5 HP when killing enemy minion OR sacrifice own minion (1/turn)
- **Nox (Reapers):** Double attack bonus from melee weapons
- **Lugh (Goblins):** +1 Thorn whenever earning Thorns

**Leveling:** 3 wins → Level 2 (Atk/Def 20), 8 wins → Level 3 (Atk/Def 30), +2 Thorns per level

## MINIONS
- **Swarmling:** Atk 3, Def 0, HP 3 (respawns in 2 turns, max 9)
- **Ravager:** Atk 25, Def 10, HP 10 (no respawn)
- **Hellspawn:** Atk 30, Def 30, HP 50 (no respawn)

## STRUCTURES (6 per player)
1. **Pulse Cannon** (5 Units): Fire ammo to deal 1 damage to enemy structure
2. **Fighting Pits** (9 Units): Roll d20 for enemy (1-16 Swarmling, 17-19 Ravager, 20 Hellspawn). Win = Thorns + level progress
3. **Swarm Portal** (6 Units): Spawn Swarmling every 3 turns
4. **Ammo Vein** (3 Units): Collect 1 ammo every other turn (max 3)
5. **Swarm Mother** (3 Units): Boss - Atk 10, Def 5, HP 5. Drops 2 Thorns. Respawns in 3 turns
6. **GateKeeper** (4 Units): Boss - Atk 12, Def 0, HP 10. Drops 5 Thorns. Respawns in 3 turns

**Note:** 1 Unit = 10 HP for Hunter attacks

## NEUTRAL STRUCTURES
- **Temple of Sacrifice:** Sacrifice Swarmlings for Souls (auto-collected). 10 Souls = control Roog (destroys 1 enemy structure/turn)
- **Barracks:** Buy weapons (9-15 Thorns)

## WEAPONS
| Weapon | Attack | Defense | Cost | Special |
|--------|--------|---------|------|---------|
| Brutal Axe | +5 | +15 | 9 | - |
| Elder's Staff | +10 | +10 | 9 | - |
| War Flail | +15 | +5 | 9 | - |
| Hanzo Katana | +15 | +5 | 9 | - |
| Vipers | +20 | +0 | 9 | - |
| Predator Missiles | +20 | +0 | 15 | Hit 3 adjacent tiles |
| Shield of Abomination | +5 | +20 | 15 | Swarmlings +3 HP |

**Nox doubles attack bonus from first 5 melee weapons**

## STRANGLETHORNS (5 Tiers)
Block enemy territory access. Must defeat all 5 to cross.
- T1: Def 5, HP 5
- T2: Def 10, HP 10
- T3: Def 15, HP 15
- T4: Def 20, HP 20
- T5: Def 25, HP 25

## ASSET STRUCTURE
```
assets/
├── board/
│   └── stranglethorn_board.png
├── sprites/
│   ├── hunters/
│   │   ├── zahra.png (256x256)
│   │   ├── andromeda.png (256x256)
│   │   ├── nox.png (256x256)
│   │   └── lugh.png (256x256)
│   ├── minions/
│   │   ├── swarmling.png (256x256)
│   │   ├── ravager.png (256x256)
│   │   └── hellspawn.png (256x256)
│   ├── structures/
│   │   ├── pulse_cannon.png (256x256)
│   │   ├── fighting_pits.png (256x256)
│   │   ├── swarm_portal.png (256x256)
│   │   ├── ammo_vein.png (256x256)
│   │   ├── swarm_mother.png (256x256)
│   │   ├── gatekeeper.png (256x256)
│   │   ├── temple.png (432x256, 16:9)
│   │   └── barracks.png (432x256, 16:9)
│   └── stranglethorns/
│       └── base.png (256x256, scale for tiers)
```

## HEX GRID SYSTEM
- **Coordinates:** Axial (q, r)
- **Layout:** Flat-top hexagons
- **Distance:** `(|q1-q2| + |r1-r2| + |(q1+r1)-(q2+r2)|) / 2`

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Days 1-3)
- Phaser setup + board image
- Hex grid overlay
- Dice rolling UI
- Hunter placement & movement
- Turn system

### Phase 2: Combat (Days 4-7)
- Structure placement
- Attack mechanics (Hunter vs Hunter, Hunter vs Structure)
- Stranglethorn barrier
- Combined attack system
- Victory conditions

### Phase 3: Economy (Days 8-10)
- Thorn system
- Fighting Pits (d20 rolls, leveling)
- Barracks shop
- Weapon equipping
- Boss fights & respawns

### Phase 4: Minions & Polish (Days 11-14)
- Swarm Portal spawning
- Pack movement logic
- Temple of Sacrifice + Roog
- Hunter passives
- Sound effects & polish

## CRITICAL GAME STATE
```javascript
gameState = {
  currentPlayer: 1 | 2,
  turnCount: number,
  winner: null | 1 | 2,
  
  players: {
    1: {
      hunter: { type, level, hp, attack, defense, position, equippedWeapon, fightingPitsWins },
      resources: { thorns, ammo, souls },
      structures: { /* 6 structures with hp, position, cooldown */ },
      minions: { swarmlings: [], ravagers: [], hellspawns: [] },
      usedBloodSacrifice: false // Andromeda only
    },
    2: { /* same */ }
  },
  
  dice: { lastRoll: number, remainingMoves: number },
  board: { hexGrid: HexCell[][], stranglethorns: [], neutralStructures: {} }
}
```

## KEY MECHANICS TO IMPLEMENT

**Pack Movement:**
```javascript
// Hunter + adjacent minions move together (1 move cost)
function movePackWithLeader(leader, destination, allUnits) {
  const adjacent = getAdjacentUnits(leader, allUnits);
  const offset = { q: destination.q - leader.q, r: destination.r - leader.r };
  
  leader.position = destination;
  adjacent.forEach(unit => {
    unit.position.q += offset.q;
    unit.position.r += offset.r;
  });
  return 1; // Cost
}
```

**Combined Attack:**
```javascript
// Sum all adjacent units' attack vs one target
function executeCombinedAttack(attackers, target) {
  const totalAttack = attackers.reduce((sum, u) => sum + u.attack, 0);
  const damage = Math.max(0, totalAttack - target.defense);
  target.hp -= damage;
  attackers.forEach(u => u.hasAttacked = true);
  return damage;
}
```

**Hunter Passives:**
- Apply on relevant triggers (dice_roll, minion_killed, equip_weapon, thorns)
- Andromeda: Track `usedBloodSacrifice` boolean, reset each turn
- Nox: Double weapon attack bonus at equip time
- Lugh: Add +1 Thorn after any Thorn gain
- Zahra: 25% roll on dice for +1 movement

## FIGHTING PITS REWARDS
- Swarmling (d20: 1-16): 1 Thorn
- Ravager (d20: 17-19): 3 Thorns
- Hellspawn (d20: 20): 5 Thorns
- Apply Lugh's passive if applicable

## DEFERRED FEATURES (Post-Beta)
- UDAS artillery strikes
- Special equipment (Carpet, Pegasus Wings, Traps)
- Minion capture from Fighting Pits
- Advanced animations

---

## START HERE
1. Set up Phaser project with Vite
2. Load board image as base layer
3. Implement hex grid coordinate system
4. Add dice rolling UI
5. Place Hunter sprites and enable movement

Full technical details in `STRANGLETHORN_GDD.md`
