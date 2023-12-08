export function isStringEnumValue<T extends { [k: string]: string }>(
  value: any,
  enumObject: T
): value is T[keyof T] {
  return typeof value === 'string' && Object.values(enumObject).includes(value);
}
