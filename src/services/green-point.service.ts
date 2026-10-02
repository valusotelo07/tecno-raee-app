import { supabase } from '@/config/supabase';
import type { GreenPoint } from '@/models/GreenPoint';
import type { DeviceCategory } from '@/models/DeviceCategory';

export interface GreenPointRow {
  id: string;
  company_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  time_zone: string;
  pickup_enabled: boolean;
  companies: { name: string; status: string };
  green_point_schedules: { weekday: number; opens_minute: number; closes_minute: number }[];
  green_point_device_categories: { device_categories: DeviceCategory | null }[];
}
export function mapGreenPoint(row: GreenPointRow): GreenPoint {
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.companies.name,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    description: row.description,
    timeZone: row.time_zone,
    pickupEnabled: row.pickup_enabled,
    categories: row.green_point_device_categories
      .flatMap((r) => (r.device_categories ? [r.device_categories] : []))
      .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    schedules: row.green_point_schedules
      .map((s) => ({
        weekday: s.weekday,
        opensMinute: s.opens_minute,
        closesMinute: s.closes_minute,
      }))
      .sort((a, b) => a.weekday - b.weekday || a.opensMinute - b.opensMinute),
  };
}
// Explicit public filters also apply to company/admin sessions. RLS remains the authority.
export async function getGreenPoints(signal?: AbortSignal): Promise<GreenPoint[]> {
  const points: GreenPoint[] = [];
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    let query = supabase
      .from('green_points')
      .select(
        `
      id, company_id, name, address, latitude, longitude, phone, description, time_zone, pickup_enabled,
      companies!inner(name, status),
      green_point_schedules(weekday, opens_minute, closes_minute),
      green_point_device_categories(device_categories(id, name, slug))
    `
      )
      .eq('active', true)
      .eq('companies.status', 'ACTIVE')
      .order('name')
      .order('id')
      .range(start, start + pageSize - 1);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as unknown as GreenPointRow[];
    points.push(...rows.map(mapGreenPoint));
    if (rows.length < pageSize) return points;
  }
}
