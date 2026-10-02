import type { Coordinates, GreenPoint } from '@/models/GreenPoint';
export interface PointsMapProps {
  points: GreenPoint[];
  location?: Coordinates | null;
  preview?: boolean;
  onSelect: (point: GreenPoint) => void;
}
