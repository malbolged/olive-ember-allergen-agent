// Document ids use hyphens, never dots: an id containing "." lives under a path in Sanity
// and is hidden from unauthenticated reads, which would break the public dataset.

export type SanityDoc = {_id: string; _type: string; [field: string]: unknown}

export type Reference = {_type: 'reference'; _ref: string; _key?: string}

export const ref = (id: string): Reference => ({_type: 'reference', _ref: id})

/** Array of references with `_key`s derived from the local id (unique within one array). */
export const refs = (prefix: string, ids: string[]): Reference[] =>
  ids.map((id) => ({_type: 'reference', _ref: `${prefix}-${id}`, _key: id}))

export const slug = (current: string) => ({_type: 'slug' as const, current})
