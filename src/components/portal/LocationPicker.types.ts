import type { Coordinates } from '@/models/GreenPoint';
export interface LocationPickerProps {
  value: Coordinates | null;
  onChange: (coordinate: Coordinates) => void;
  disabled?: boolean;
}
