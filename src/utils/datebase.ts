import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { TaskTable, DateTable } from '@/types/index'
import { message } from 'ant-design-vue'

interface LocalDb extends DBSchema {
    'dates': {
        key: string
        value: DateTable
        indexes: {
            'by-memo': string
        }
    }
    'tasks': {
        key: number
        value: TaskTable
        indexes: {
            'by-description': string
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
                const taskStore = db.createObjectStore('tasks', { keyPath: "id", autoIncrement: true })
                taskStore.createIndex('by-description', 'description')
            }
            else if (oldVersion === 1) {
                try {
                    const storedDates = await transaction.objectStore("dates").getAll()
                    const storedTasks = await transaction.objectStore("tasks").getAll()
                    db.deleteObjectStore("dates")
                    db.deleteObjectStore("tasks")
                    const dateStore = db.createObjectStore('dates', { keyPath: "date" })
                    dateStore.createIndex('by-memo', 'memo')
                    const taskStore = db.createObjectStore('tasks', { keyPath: "id", autoIncrement: true })
                    taskStore.createIndex('by-description', 'description')
                    for (const storedDate of storedDates) {
                        dateStore.add(storedDate)
                    }
                    for (const storedTask of storedTasks) {
                        taskStore.add(storedTask)
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