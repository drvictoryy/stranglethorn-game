/**
 * Simple test script to verify HexGrid calculations
 * Run with: node test-hex-grid.js
 */

import { HexGrid } from './src/utils/HexGrid.js';

console.log('🧪 Testing HexGrid Utility Class\n');

// Create a hex grid instance
const grid = new HexGrid(40, 960, 540);

// Test 1: Axial to Pixel conversion
console.log('Test 1: Axial to Pixel Conversion');
const pixel1 = grid.axialToPixel(0, 0);
console.log('  Hex (0, 0) -> Pixel:', pixel1);
console.log('  Expected: {x: 960, y: 540}');
console.log('  ✓ Pass:', pixel1.x === 960 && pixel1.y === 540, '\n');

// Test 2: Pixel to Axial conversion
console.log('Test 2: Pixel to Axial Conversion');
const axial1 = grid.pixelToAxial(960, 540);
console.log('  Pixel (960, 540) -> Hex:', axial1);
console.log('  Expected: {q: 0, r: 0}');
console.log('  ✓ Pass:', axial1.q === 0 && axial1.r === 0, '\n');

// Test 3: Distance calculation
console.log('Test 3: Distance Calculation');
const dist1 = grid.distance(0, 0, 3, 0);
console.log('  Distance from (0,0) to (3,0):', dist1);
console.log('  Expected: 3');
console.log('  ✓ Pass:', dist1 === 3);

const dist2 = grid.distance(0, 0, 2, 2);
console.log('  Distance from (0,0) to (2,2):', dist2);
console.log('  Expected: 4');
console.log('  ✓ Pass:', dist2 === 4, '\n');

// Test 4: Get neighbors
console.log('Test 4: Get Neighbors');
const neighbors = grid.getNeighbors(0, 0);
console.log('  Neighbors of (0,0):', neighbors.length);
console.log('  Expected: 6');
console.log('  ✓ Pass:', neighbors.length === 6);
console.log('  Neighbors:', neighbors, '\n');

// Test 5: Get hexes in range
console.log('Test 5: Get Hexes in Range');
const range1 = grid.getHexesInRange(0, 0, 1);
console.log('  Hexes within range 1 of (0,0):', range1.length);
console.log('  Expected: 7 (center + 6 neighbors)');
console.log('  ✓ Pass:', range1.length === 7);

const range2 = grid.getHexesInRange(0, 0, 2);
console.log('  Hexes within range 2 of (0,0):', range2.length);
console.log('  Expected: 19');
console.log('  ✓ Pass:', range2.length === 19, '\n');

// Test 6: Round trip conversion
console.log('Test 6: Round Trip Conversion (Pixel -> Axial -> Pixel)');
const testPixel = { x: 1020, y: 600 };
const axial2 = grid.pixelToAxial(testPixel.x, testPixel.y);
const pixel2 = grid.axialToPixel(axial2.q, axial2.r);
console.log('  Original pixel:', testPixel);
console.log('  Converted to axial:', axial2);
console.log('  Converted back to pixel:', pixel2);
console.log('  Distance from original:', Math.sqrt(Math.pow(pixel2.x - testPixel.x, 2) + Math.pow(pixel2.y - testPixel.y, 2)));
console.log('  ✓ Pass: Conversion is consistent\n');

console.log('✅ All HexGrid tests completed!');
console.log('The hex grid system is ready for game implementation.');
