// Build a Google Maps "directions" URL the user can tap to open the native
// maps app on iOS/Android, or maps.google.com on desktop.
// Docs: https://developers.google.com/maps/documentation/urls/get-started

export function directionsUrl(coords: { lat: number; lng: number }): string {
  const dest = `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

export function placeUrl(coords: { lat: number; lng: number }, label?: string): string {
  const q = label ? `${label} (${coords.lat},${coords.lng})` : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function parseCoords(raw: string | null): { lat: number; lng: number } | null {
  if (!raw) return null;
  const [latStr, lngStr] = raw.split(",").map((s) => s.trim());
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
