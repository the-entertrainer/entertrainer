/**
 * `empower-tools` database (DESIGN_SPEC §7.2).
 * The spec names Dexie. Dexie is not installed; this is the same database
 * name on IndexedDB so drafts, decks, and recently used stay in the browser
 * without a new dependency.
 */

export interface RecentTool {
  id: string
  title: string
  href: string
  usedAt: number
}

const DB_NAME = 'empower-tools'
const DB_VERSION = 1

let opening: Promise<IDBDatabase> | null = null

function supported(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  if (!supported()) return Promise.reject(new Error('IndexedDB is not available.'))
  if (opening) return opening
  opening = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('recent')) db.createObjectStore('recent', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv', { keyPath: 'key' })
      if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('decks')) db.createObjectStore('decks', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('cards')) {
        const cards = db.createObjectStore('cards', { keyPath: 'id' })
        cards.createIndex('deckId', 'deckId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      opening = null
      reject(req.error ?? new Error('Could not open empower-tools.'))
    }
  })
  return opening
}

function finish<T>(tx: IDBTransaction, value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(value)
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed.'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted.'))
  })
}

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDb()
    const tx = db.transaction('kv', 'readonly')
    const req = tx.objectStore('kv').get(key)
    const row = await new Promise<{ value?: T } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return row?.value ?? null
  } catch {
    return null
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put({ key, value })
    await finish(tx, undefined)
  } catch {
    /* Private mode and older browsers can refuse IndexedDB. The tool still runs. */
  }
}

export async function recentList(): Promise<RecentTool[]> {
  try {
    const db = await openDb()
    const tx = db.transaction('recent', 'readonly')
    const req = tx.objectStore('recent').getAll()
    const rows = await new Promise<RecentTool[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror = () => reject(req.error)
    })
    return rows.sort((a, b) => b.usedAt - a.usedAt).slice(0, 8)
  } catch {
    return []
  }
}

export async function touchRecent(item: { id: string; title: string; href: string }): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('recent', 'readwrite')
      const store = tx.objectStore('recent')
      store.put({ ...item, usedAt: Date.now() })
      const all = store.getAll()
      all.onsuccess = () => {
        const rows = (all.result as RecentTool[]).sort((a, b) => b.usedAt - a.usedAt)
        for (const extra of rows.slice(8)) store.delete(extra.id)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

export async function idbAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    return await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function idbPut(storeName: string, value: unknown): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).put(value)
  await finish(tx, undefined)
}

export async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    await finish(tx, undefined)
  } catch {
    /* ignore */
  }
}

export async function idbByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Promise<T[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).index(indexName).getAll(key)
    return await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}
