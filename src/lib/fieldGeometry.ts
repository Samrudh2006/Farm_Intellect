/**
 * Field Geometry Library
 * Polygon operations, area calculations, and field validation
 */

export interface FieldPoint {
  lat: number;
  lng: number;
}

export interface FieldPolygon {
  id: string;
  name: string;
  points: FieldPoint[];
  areaHectares: number;
  areaAcres: number;
  centerLat: number;
  centerLng: number;
  createdAt: Date;
  cropType?: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  vertexCount: number;
  selfIntersecting: boolean;
}

/**
 * Calculate area of polygon using Shoelace formula (in hectares)
 * Assumes coordinates are in decimal degrees
 */
export function calculatePolygonArea(points: FieldPoint[]): { hectares: number; acres: number } {
  if (points.length < 3) {
    return { hectares: 0, acres: 0 };
  }

  // Use approximate conversion for Indian coordinates
  // 1 degree latitude ≈ 111 km
  // 1 degree longitude ≈ 111 km * cos(latitude)

  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const latRad = (avgLat * Math.PI) / 180;
  const kmPerLat = 111.32;
  const kmPerLng = 40075.017 / 360 * Math.cos(latRad); // km per degree longitude

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const latDiff = (points[j].lat - points[i].lat) * kmPerLat;
    const lngDiff = (points[j].lng - points[i].lng) * kmPerLng;

    area += points[i].lng * lngDiff - points[i].lat * latDiff;
  }

  const areaKm2 = Math.abs(area / 2);
  const hectares = areaKm2 * 100; // 1 km² = 100 hectares
  const acres = hectares * 2.471; // 1 hectare ≈ 2.471 acres

  return {
    hectares: Math.round(hectares * 100) / 100,
    acres: Math.round(acres * 100) / 100,
  };
}

/**
 * Calculate polygon centroid
 */
export function calculatePolygonCentroid(points: FieldPoint[]): { lat: number; lng: number } {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

  return { lat: avgLat, lng: avgLng };
}

/**
 * Check if point is inside polygon (ray casting algorithm)
 */
export function isPointInsidePolygon(point: FieldPoint, polygon: FieldPoint[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  let p1Lat = polygon[0].lat;
  let p1Lng = polygon[0].lng;

  for (let i = 1; i <= polygon.length; i++) {
    const p2Lat = polygon[i % polygon.length].lat;
    const p2Lng = polygon[i % polygon.length].lng;

    if (point.lng > Math.min(p1Lng, p2Lng)) {
      if (point.lng <= Math.max(p1Lng, p2Lng)) {
        if (point.lat <= Math.max(p1Lat, p2Lat)) {
          if (p1Lng !== p2Lng) {
            const xinters =
              ((point.lng - p1Lng) * (p2Lat - p1Lat)) / (p2Lng - p1Lng) + p1Lat;
            if (p1Lat === p2Lat || point.lat <= xinters) {
              inside = !inside;
            }
          }
        }
      }
    }
    p1Lat = p2Lat;
    p1Lng = p2Lng;
  }

  return inside;
}

/**
 * Check for polygon self-intersection
 */
export function checkSelfIntersection(points: FieldPoint[]): boolean {
  if (points.length < 4) return false;

  const lineIntersect = (
    p1: FieldPoint,
    p2: FieldPoint,
    p3: FieldPoint,
    p4: FieldPoint
  ): boolean => {
    const ccw = (A: FieldPoint, B: FieldPoint, C: FieldPoint): boolean => {
      return (C.lng - A.lng) * (B.lat - A.lat) > (B.lng - A.lng) * (C.lat - A.lat);
    };

    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  };

  // Check each edge against non-adjacent edges
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    for (let j = i + 2; j < points.length; j++) {
      if (j === points.length - 1 && i === 0) continue; // Skip adjacent edges
      const p3 = points[j];
      const p4 = points[(j + 1) % points.length];

      if (lineIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate field polygon
 */
export function validateFieldPolygon(points: FieldPoint[]): FieldValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (points.length < 3) {
    errors.push(`Polygon needs at least 3 vertices (current: ${points.length})`);
  }

  if (points.length > 20) {
    warnings.push("Polygon has many vertices. Consider simplifying for better performance.");
  }

  // Check for duplicate points
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (Math.abs(points[i].lat - points[j].lat) < 0.00001 &&
          Math.abs(points[i].lng - points[j].lng) < 0.00001) {
        errors.push(`Duplicate vertices found at index ${i} and ${j}`);
      }
    }
  }

  const selfIntersecting = checkSelfIntersection(points);
  if (selfIntersecting) {
    errors.push("Polygon intersects itself. Please redraw.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    vertexCount: points.length,
    selfIntersecting,
  };
}

/**
 * Simplify polygon using Douglas-Peucker algorithm
 */
export function simplifyPolygon(points: FieldPoint[], tolerance: number = 0.00001): FieldPoint[] {
  if (points.length <= 2) return points;

  const perpendicularDistance = (point: FieldPoint, lineStart: FieldPoint, lineEnd: FieldPoint): number => {
    const dx = lineEnd.lng - lineStart.lng;
    const dy = lineEnd.lat - lineStart.lat;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) {
      return Math.sqrt(
        (point.lng - lineStart.lng) ** 2 + (point.lat - lineStart.lat) ** 2
      );
    }

    return Math.abs((dy * point.lng - dx * point.lat + lineEnd.lng * lineStart.lat - lineEnd.lat * lineStart.lng) / mag);
  };

  const douglasPeucker = (points: FieldPoint[], start: number, end: number, tolerance: number): number[] => {
    let maxDist = 0;
    let maxIndex = 0;

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > tolerance) {
      const result1 = douglasPeucker(points, start, maxIndex, tolerance);
      const result2 = douglasPeucker(points, maxIndex, end, tolerance);
      return [...result1.slice(0, -1), ...result2];
    } else {
      return [start, end];
    }
  };

  const indices = douglasPeucker(points, 0, points.length - 1, tolerance);
  return indices.map((i) => points[i]);
}

/**
 * Create predefined field shapes
 */
export function createFieldTemplate(
  shapeType: "rectangle" | "triangle" | "circle",
  center: FieldPoint,
  size: number // in approximate km
): FieldPoint[] {
  const points: FieldPoint[] = [];
  const latDelta = size / 111.32;
  const lngDelta = size / (111.32 * Math.cos((center.lat * Math.PI) / 180));

  switch (shapeType) {
    case "rectangle":
      // 4 corners
      points.push(
        { lat: center.lat - latDelta, lng: center.lng - lngDelta },
        { lat: center.lat - latDelta, lng: center.lng + lngDelta },
        { lat: center.lat + latDelta, lng: center.lng + lngDelta },
        { lat: center.lat + latDelta, lng: center.lng - lngDelta }
      );
      break;

    case "triangle":
      // 3 vertices
      const angle = (2 * Math.PI) / 3;
      for (let i = 0; i < 3; i++) {
        const theta = i * angle;
        points.push({
          lat: center.lat + latDelta * Math.sin(theta),
          lng: center.lng + lngDelta * Math.cos(theta),
        });
      }
      break;

    case "circle":
      // Approximate circle with 8 points
      const circleAngle = (2 * Math.PI) / 8;
      for (let i = 0; i < 8; i++) {
        const theta = i * circleAngle;
        points.push({
          lat: center.lat + latDelta * Math.sin(theta),
          lng: center.lng + lngDelta * Math.cos(theta),
        });
      }
      break;
  }

  return points;
}

/**
 * Calculate distance between two points (haversine formula)
 */
export function calculateDistance(p1: FieldPoint, p2: FieldPoint): number {
  const R = 6371; // Earth's radius in km
  const lat1Rad = (p1.lat * Math.PI) / 180;
  const lat2Rad = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate perimeter of polygon
 */
export function calculatePerimeter(points: FieldPoint[]): number {
  if (points.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    perimeter += calculateDistance(p1, p2);
  }

  return Math.round(perimeter * 100) / 100;
}

/**
 * Export polygon as GeoJSON
 */
export function exportAsGeoJSON(field: FieldPolygon): string {
  const feature = {
    type: "Feature",
    properties: {
      name: field.name,
      areaHectares: field.areaHectares,
      areaAcres: field.areaAcres,
      cropType: field.cropType,
      createdAt: field.createdAt.toISOString(),
    },
    geometry: {
      type: "Polygon",
      coordinates: [field.points.map((p) => [p.lng, p.lat])],
    },
  };

  return JSON.stringify(feature, null, 2);
}

/**
 * Import polygon from GeoJSON
 */
export function importFromGeoJSON(geojson: string): FieldPolygon | null {
  try {
    const feature = JSON.parse(geojson);

    if (feature.geometry.type !== "Polygon") {
      return null;
    }

    const coordinates = feature.geometry.coordinates[0];
    const points = coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));

    const area = calculatePolygonArea(points);
    const center = calculatePolygonCentroid(points);

    return {
      id: `field-${Date.now()}`,
      name: feature.properties?.name || "Imported Field",
      points,
      areaHectares: area.hectares,
      areaAcres: area.acres,
      centerLat: center.lat,
      centerLng: center.lng,
      createdAt: new Date(feature.properties?.createdAt || new Date()),
      cropType: feature.properties?.cropType,
    };
  } catch (error) {
    console.error("[fieldGeometry] GeoJSON import error:", error);
    return null;
  }
}
