const separator = ' · Entre calles: ';
export function splitPointAddress(address: string) {
  const position = address.lastIndexOf(separator);
  return position < 0
    ? { address, crossStreets: '' }
    : {
        address: address.slice(0, position),
        crossStreets: address.slice(position + separator.length),
      };
}
export function joinPointAddress(address: string, crossStreets: string) {
  return address.trim() + (crossStreets.trim() ? separator + crossStreets.trim() : '');
}
