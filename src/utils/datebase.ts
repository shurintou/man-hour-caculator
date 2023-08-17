import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { DateTable } from '@/types/index'
import { message } from 'ant-design-vue'

interface LocalDb extends DBSchema {
    'dates': {
        key: string
        value: DateTable
        indexes: {
            'by-memo': string
        }
    }
}

const dbVersion = 2
async function dbHandler() {
    const db = await openDB<LocalDb>("localDb", dbVersion, {
        async upgrade(db, oldVersion, newVersion, transaction, event) {
            if (oldVersion === 0) {
                const dateStore = db.createObjectStore('dates', { keyPath: "date" })
                dateStore.createIndex('by-memo', 'memo')
            }
            else if (oldVersion === 1) {
                try {
                    const storedDates = await transaction.objectStore("dates").getAll()
                    db.deleteObjectStore("dates")
                    const dateStore = db.createObjectStore('dates', { keyPath: "date" })
                    dateStore.createIndex('by-memo', 'memo')
                    for (const storedDate of storedDates) {
                        dateStore.add(storedDate)
                    }
                    transaction.done
                }
                catch (e: any) {
                    console.error(e)
                    message.error(e.message)
                    transaction.abort()
                }
            }
        },
        blocked() {
            db.close()
            message.error('Another page is conflicting with current, please close it and try again.')
        },
        blocking() {
            db.close()
            message.warning('Database is outdated, please reload the page.')
        },
    })

    return db
}
export default dbHandler()