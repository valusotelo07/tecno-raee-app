import type { Coordinates } from '@/models/GreenPoint';
export interface AddressSuggestion extends Coordinates {
  id: string;
  address: string;
}
// Public client key: configure domain restrictions and quotas in Geoapify.
const key = process.env.EXPO_PUBLIC_GEOAPIFY_KEY?.trim();
export const addressAutocompleteEnabled = Boolean(key);
export async function suggestAddresses(
  text: string,
  signal: AbortSignal
): Promise<AddressSuggestion[]> {
  if (!key) return [];
  const params = new URLSearchParams({
    text,
    apiKey: key,
    format: 'json',
    limit: '5',
    lang: 'es',
    bias: 'countrycode:ar',
  });
  const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
    signal,
  });
  if (!response.ok)
    throw new Error('No pudimos buscar la dirección. Marcá la ubicación en el mapa.');
  const data = await response.json();
  return (data.results ?? [])
    .filter(
      (r: Record<string, unknown>) =>
        typeof r.lat === 'number' && typeof r.lon === 'number' && typeof r.formatted === 'string'
    )
    .map((r: { place_id: string; formatted: string; lat: number; lon: number }) => ({
      id: r.place_id,
      address: r.formatted,
      latitude: r.lat,
      longitude: r.lon,
    }));
}
