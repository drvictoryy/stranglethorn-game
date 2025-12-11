1. Hunter Selection (Phase: hunterSelection)
 Screen shows "CHOOSE YOUR HUNTER" title
 All 4 hunter cards display correctly (Zahra, Andromeda, Nox, Lugh)
 Hunter sprites load and display in cards
 Cards highlight on hover (orange border)
 "PLAYER 1" text shows at top
 Click a hunter → "PLAYER 2" text appears
 Click second hunter → Selection screen disappears
 Both hunters appear on board after selection
2. Hunter Placement (Phase: placement)
 Player 1 hunter appears bottom-left area
 Player 2 hunter appears top-right area
 Hunters are appropriately scaled (not too big/small)
 "PLACING HUNTERS..." text briefly appears
 Transitions smoothly to playing phase
3. Dice Rolling (Phase: playing)
 Dice panel appears in top-right
 Shows "?" before rolling
 "ROLL DICE" button is clickable
 Button highlights green on hover
 Click button → Shows number 1-6
 Number updates in player info panel
 "Moves Left" updates to match roll
 Can't roll again if you still have moves left (check console)
4. Zahra's Passive (if Zahra selected)
 Roll dice multiple times
 Check console logs for "Zahra's passive triggered!"
 When triggered: Moves Left = Roll + 1
 Happens roughly 1 in 4 rolls (25% chance)
5. Movement System
 Hex grid overlay visible on board
 Hover over hexes → Yellow highlight appears
 Click adjacent hex → Hunter moves smoothly
 Movement animation is smooth (300ms)
 "Moves Left" decreases by 1
 Position updates in player info panel
 Can only move to adjacent hexes (not diagonal jumps)
 Clicking far hex → Console shows "Can only move to adjacent hexes!"
 Clicking without moves → Console shows "No moves remaining!"
6. Turn Management
 After last move → Turn auto-ends after 0.5 second
 Current player switches (1 → 2 or 2 → 1)
 Phase text updates: "PLAYER X'S TURN"
 Dice resets to "?"
 Moves Left resets to 0
 Player info panel updates for new player
 New player can roll dice
7. UI Elements
 Title: "STRANGLETHORN" visible at top
 Phase text: Yellow text shows current phase/turn
 Player info (top-left):
Shows current player number
Shows hunter name
Shows dice roll
Shows moves left
Shows position coordinates
 Dice panel (top-right):
Shows dice value
Roll button works
 All text is readable on the board background
Complete Gameplay Flow Test
Play a full round to test everything together:

Start game → Hunter selection appears
Player 1 selects Zahra
Player 2 selects Nox
Hunters appear on board
Player 1's turn:
Roll dice (e.g., get 4)
Move 4 times (click 4 adjacent hexes)
Turn auto-ends
Player 2's turn:
Roll dice
Move their hunter
Turn auto-ends
Repeat several turns to verify stability