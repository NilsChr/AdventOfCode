/**
 * Checks if the outerPolygon fully contains the innerPolygon (e.g., a rectangle).
 * @param outerPoly The container polygon
 * @param innerPoly The shape to check (e.g., the rectangle)
 */
export function doesPolygonContain(
  outerPoly: number[][],
  innerPoly: number[][]
): boolean {
  for (const point of innerPoly) {
    if (!isPointInOrOnPolygon(point, outerPoly)) {
      return false;
    }
  }

  // 2. Check for "Strict" Edge Crossings
  // Even if all points are inside, a shape could "cross" a concave boundary
  // (e.g., a "C" shaped room with a rectangle spanning the gap).
  // We check if any edges strictly cross (form an X). Overlaps/Touching are allowed.
  if (doEdgesStrictlyCross(outerPoly, innerPoly)) {
    return false;
  }

  return true;
}

function doEdgesStrictlyCross(p1: number[][], p2: number[][]): boolean {
  const len1 = p1.length;
  const len2 = p2.length;

  for (let i = 0; i < len1; i++) {
    const p1Start = p1[i];
    const p1End = p1[(i + 1) % len1];

    for (let j = 0; j < len2; j++) {
      const p2Start = p2[j];
      const p2End = p2[(j + 1) % len2];

      if (segmentsCrossStrictly(p1Start, p1End, p2Start, p2End)) {
        return true;
      }
    }
  }
  return false;
}

// Checks for a strict "X" crossing.
// Returns FALSE for T-junctions, shared edges, or parallel lines.
function segmentsCrossStrictly(
  a1: number[],
  a2: number[],
  b1: number[],
  b2: number[]
): boolean {
  const ax1 = a1[0],
    ay1 = a1[1],
    ax2 = a2[0],
    ay2 = a2[1];
  const bx1 = b1[0],
    by1 = b1[1],
    bx2 = b2[0],
    by2 = b2[1];

  // 1. If Parallel (both Horizontal or both Vertical), they cannot "cross" strictly
  // (They might overlap, but that is allowed in containment)
  const aIsHoriz = ay1 === ay2;
  const bIsHoriz = by1 === by2;

  if (aIsHoriz === bIsHoriz) return false;

  // 2. Perpendicular Check
  // A strict cross happens ONLY if the lines straddle each other strictly.
  // The intersection point must not be an endpoint.

  let hx1: number, hx2: number, hy: number; // Horizontal Seg params
  let vx: number, vy1: number, vy2: number; // Vertical Seg params

  if (aIsHoriz) {
    hx1 = Math.min(ax1, ax2);
    hx2 = Math.max(ax1, ax2);
    hy = ay1;
    vx = bx1;
    vy1 = Math.min(by1, by2);
    vy2 = Math.max(by1, by2);
  } else {
    hx1 = Math.min(bx1, bx2);
    hx2 = Math.max(bx1, bx2);
    hy = by1;
    vx = ax1;
    vy1 = Math.min(ay1, ay2);
    vy2 = Math.max(ay1, ay2);
  }

  // Strict check: strictly greater/less than (no <= or >=)
  // If vx == hx1, it's a T-junction (touching), which is NOT a cross.
  return vx > hx1 && vx < hx2 && hy > vy1 && hy < vy2;
}

export function isPointInOrOnPolygon(point: number[], poly: number[][]): boolean {
  // 1. Check if point is strictly ON a segment (boundary)
  // This is necessary because standard ray-casting is unpredictable on edges
  if (isPointOnPolyBoundary(point, poly)) return true;

  // 2. Ray Casting for "Inside" check
  const x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1];
    const xj = poly[j][0],
      yj = poly[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointOnPolyBoundary(pt: number[], poly: number[][]): boolean {
  const x = pt[0],
    y = pt[1];
  const len = poly.length;
  for (let i = 0; i < len; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % len];

    // Check if point lies on horizontal segment
    if (p1[1] === p2[1] && p1[1] === y) {
      if (x >= Math.min(p1[0], p2[0]) && x <= Math.max(p1[0], p2[0]))
        return true;
    }
    // Check if point lies on vertical segment
    else if (p1[0] === p2[0] && p1[0] === x) {
      if (y >= Math.min(p1[1], p2[1]) && y <= Math.max(p1[1], p2[1]))
        return true;
    }
  }
  return false;
}

/**
 * Checks if two rectilinear polygons intersect.
 * @param poly1 Array of vectors [[x1, y1], [x2, y2], ...]
 * @param poly2 Array of vectors [[x1, y1], [x2, y2], ...]
 */
function doPolygonsIntersect(poly1: number[][], poly2: number[][]): boolean {
  // 1. Fast Fail: Check Bounding Boxes first
  if (!boundingBoxesIntersect(poly1, poly2)) {
    return false;
  }

  // 2. Check if any edges intersect (covers partial overlaps and crossing)
  if (hasEdgeIntersections(poly1, poly2)) {
    return true;
  }

  // 3. Check for Containment (one completely inside the other)
  if (isPointInPolygon(poly1[0], poly2)) return true;
  if (isPointInPolygon(poly2[0], poly1)) return true;

  return false;
}

// --- Helper Functions ---

function boundingBoxesIntersect(p1: number[][], p2: number[][]): boolean {
  let minX1 = Infinity,
    minY1 = Infinity,
    maxX1 = -Infinity,
    maxY1 = -Infinity;
  let minX2 = Infinity,
    minY2 = Infinity,
    maxX2 = -Infinity,
    maxY2 = -Infinity;

  for (const p of p1) {
    minX1 = Math.min(minX1, p[0]);
    maxX1 = Math.max(maxX1, p[0]);
    minY1 = Math.min(minY1, p[1]);
    maxY1 = Math.max(maxY1, p[1]);
  }
  for (const p of p2) {
    minX2 = Math.min(minX2, p[0]);
    maxX2 = Math.max(maxX2, p[0]);
    minY2 = Math.min(minY2, p[1]);
    maxY2 = Math.max(maxY2, p[1]);
  }

  return !(maxX1 < minX2 || maxX2 < minX1 || maxY1 < minY2 || maxY2 < minY1);
}

function hasEdgeIntersections(p1: number[][], p2: number[][]): boolean {
  const len1 = p1.length;
  const len2 = p2.length;

  for (let i = 0; i < len1; i++) {
    // Current segment for Poly 1
    const p1Start = p1[i];
    const p1End = p1[(i + 1) % len1]; // Wrap around to first point

    for (let j = 0; j < len2; j++) {
      // Current segment for Poly 2
      const p2Start = p2[j];
      const p2End = p2[(j + 1) % len2];

      if (segmentsIntersect(p1Start, p1End, p2Start, p2End)) {
        return true;
      }
    }
  }
  return false;
}

function segmentsIntersect(
  a1: number[],
  a2: number[],
  b1: number[],
  b2: number[]
): boolean {
  const ax1 = a1[0],
    ay1 = a1[1],
    ax2 = a2[0],
    ay2 = a2[1];
  const bx1 = b1[0],
    by1 = b1[1],
    bx2 = b2[0],
    by2 = b2[1];

  // Normalize coordinates (min to max) for easier range checking
  const aMinX = Math.min(ax1, ax2),
    aMaxX = Math.max(ax1, ax2);
  const aMinY = Math.min(ay1, ay2),
    aMaxY = Math.max(ay1, ay2);
  const bMinX = Math.min(bx1, bx2),
    bMaxX = Math.max(bx1, bx2);
  const bMinY = Math.min(by1, by2),
    bMaxY = Math.max(by1, by2);

  // Case 1: Both Horizontal
  if (ay1 === ay2 && by1 === by2) {
    return ay1 === by1 && aMaxX >= bMinX && bMaxX >= aMinX;
  }
  // Case 2: Both Vertical
  if (ax1 === ax2 && bx1 === bx2) {
    return ax1 === bx1 && aMaxY >= bMinY && bMaxY >= aMinY;
  }
  // Case 3: A Horizontal, B Vertical
  if (ay1 === ay2 && bx1 === bx2) {
    return bx1 >= aMinX && bx1 <= aMaxX && ay1 >= bMinY && ay1 <= bMaxY;
  }
  // Case 4: A Vertical, B Horizontal
  if (ax1 === ax2 && by1 === by2) {
    return ax1 >= bMinX && ax1 <= bMaxX && by1 >= aMinY && by1 <= aMaxY;
  }
  return false;
}

function isPointInPolygon(point: number[], poly: number[][]): boolean {
  const x = point[0],
    y = point[1];
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1];
    const xj = poly[j][0],
      yj = poly[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
