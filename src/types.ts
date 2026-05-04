// Doesn't produce `& Partial<{}>` in resulting type if T has no keys
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PartialLaconic<T> = {} extends T ? {} : Partial<T>;
