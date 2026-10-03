export function matchesAdminSearch(query: string, ...values: string[]) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  return values.some((value) => normalize(value).includes(normalize(query)));
}
