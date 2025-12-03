/**
 * HexGrid - Axial coordinate system for flat-top hexagons
 *
 * Coordinate system: q (column), r (row)
 * Layout: Flat-top hexagons
 */

export class HexGrid {
  /**
   * @param {number} hexSize - Radius of hexagon (center to corner)
   * @param {number} originX - Screen X coordinate of hex (0,0)
   * @param {number} originY - Screen Y coordinate of hex (0,0)
   */
  constructor(hexSize, originX, originY) {
    this.hexSize = hexSize;
    this.originX = originX;
    this.originY = originY;

    // Flat-top hex constants
    this.width = hexSize * 2;
    this.height = Math.sqrt(3) * hexSize;
  }

  /**
   * Convert axial coordinates (q, r) to screen pixel coordinates
   * @param {number} q - Axial q coordinate
   * @param {number} r - Axial r coordinate
   * @returns {{x: number, y: number}} Screen coordinates
   */
  axialToPixel(q, r) {
    const x = this.originX + this.hexSize * (3/2 * q);
    const y = this.originY + this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  }

  /**
   * Convert screen pixel coordinates to axial coordinates
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @returns {{q: number, r: number}} Axial coordinates
   */
  pixelToAxial(x, y) {
    const px = (x - this.originX) / this.hexSize;
    const py = (y - this.originY) / this.hexSize;

    const q = (2/3) * px;
    const r = (-1/3) * px + (Math.sqrt(3)/3) * py;

    return this.roundAxial(q, r);
  }

  /**
   * Round fractional axial coordinates to nearest hex
   * @param {number} q - Fractional q coordinate
   * @param {number} r - Fractional r coordinate
   * @returns {{q: number, r: number}} Rounded axial coordinates
   */
  roundAxial(q, r) {
    const s = -q - r;

    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }

    return { q: rq, r: rr };
  }

  /**
   * Calculate distance between two hexes
   * @param {number} q1 - First hex q coordinate
   * @param {number} r1 - First hex r coordinate
   * @param {number} q2 - Second hex q coordinate
   * @param {number} r2 - Second hex r coordinate
   * @returns {number} Distance in hexes
   */
  distance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((q1 + r1) - (q2 + r2))) / 2;
  }

  /**
   * Get all neighbors of a hex
   * @param {number} q - Hex q coordinate
   * @param {number} r - Hex r coordinate
   * @returns {Array<{q: number, r: number}>} Array of neighbor coordinates
   */
  getNeighbors(q, r) {
    const directions = [
      { q: 1, r: 0 },   // East
      { q: 1, r: -1 },  // Northeast
      { q: 0, r: -1 },  // Northwest
      { q: -1, r: 0 },  // West
      { q: -1, r: 1 },  // Southwest
      { q: 0, r: 1 }    // Southeast
    ];

    return directions.map(dir => ({
      q: q + dir.q,
      r: r + dir.r
    }));
  }

  /**
   * Get all hexes within a certain range
   * @param {number} q - Center hex q coordinate
   * @param {number} r - Center hex r coordinate
   * @param {number} range - Range in hexes
   * @returns {Array<{q: number, r: number}>} Array of hex coordinates
   */
  getHexesInRange(q, r, range) {
    const results = [];

    for (let dq = -range; dq <= range; dq++) {
      for (let dr = Math.max(-range, -dq - range); dr <= Math.min(range, -dq + range); dr++) {
        results.push({ q: q + dq, r: r + dr });
      }
    }

    return results;
  }

  /**
   * Get the six corner points of a hexagon in pixel coordinates
   * @param {number} q - Hex q coordinate
   * @param {number} r - Hex r coordinate
   * @returns {Array<{x: number, y: number}>} Array of corner points
   */
  getHexCorners(q, r) {
    const center = this.axialToPixel(q, r);
    const corners = [];

    // For flat-top hexagons, corners start at 0° and go clockwise
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      corners.push({
        x: center.x + this.hexSize * Math.cos(angle),
        y: center.y + this.hexSize * Math.sin(angle)
      });
    }

    return corners;
  }

  /**
   * Draw a hexagon outline
   * @param {Phaser.GameObjects.Graphics} graphics - Phaser graphics object
   * @param {number} q - Hex q coordinate
   * @param {number} r - Hex r coordinate
   * @param {number} color - Hex color value (e.g., 0xffffff)
   * @param {number} alpha - Alpha value (0-1)
   * @param {number} lineWidth - Line width in pixels
   */
  drawHex(graphics, q, r, color = 0xffffff, alpha = 1, lineWidth = 2) {
    const corners = this.getHexCorners(q, r);

    graphics.lineStyle(lineWidth, color, alpha);
    graphics.beginPath();
    graphics.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      graphics.lineTo(corners[i].x, corners[i].y);
    }

    graphics.closePath();
    graphics.strokePath();
  }

  /**
   * Draw a filled hexagon
   * @param {Phaser.GameObjects.Graphics} graphics - Phaser graphics object
   * @param {number} q - Hex q coordinate
   * @param {number} r - Hex r coordinate
   * @param {number} color - Hex color value (e.g., 0xffffff)
   * @param {number} alpha - Alpha value (0-1)
   */
  fillHex(graphics, q, r, color = 0xffffff, alpha = 1) {
    const corners = this.getHexCorners(q, r);

    graphics.fillStyle(color, alpha);
    graphics.beginPath();
    graphics.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      graphics.lineTo(corners[i].x, corners[i].y);
    }

    graphics.closePath();
    graphics.fillPath();
  }
}
