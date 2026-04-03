import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'vivekanjan.db')

export const db = new Database(dbPath)
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

export async function query(sql, params = []) {
  try {
    const upper = sql.trim().toUpperCase()
    
    if (upper.startsWith('SELECT')) {
      const stmt = db.prepare(sql)
      const rows = stmt.all(...params)
      return { rows, rowCount: rows.length }
    } 
    else if (upper.startsWith('INSERT')) {
      const stmt = db.prepare(sql)
      const info = stmt.run(...params)
      return { 
        rows: [{ id: info.lastInsertRowid }], 
        rowCount: info.changes 
      }
    } 
    else if (upper.startsWith('UPDATE')) {
      const stmt = db.prepare(sql)
      const info = stmt.run(...params)
      return { rows: [], rowCount: info.changes }
    } 
    else if (upper.startsWith('DELETE')) {
      const stmt = db.prepare(sql)
      const info = stmt.run(...params)
      return { rows: [], rowCount: info.changes }
    }
    
    const stmt = db.prepare(sql)
    stmt.run(...params)
    return { rows: [], rowCount: 0 }
  } catch (err) {
    console.error('DB Error:', err.message, '\nSQL:', sql)
    throw err
  }
}

export async function withTransaction(callback) {
  const txn = db.transaction(callback)
  return txn(db)
}

export const pool = {
  end: async () => {
    try {
      db.close()
    } catch (err) {
      console.error('Error closing DB:', err.message)
    }
  },
}
