import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { TaskTable, DateTable } from '@/types/index'
import { message } from 'ant-design-vue'
const [messageApi] = message.useMessage()



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

const dbVersion = 1
async function dbHandler() {
    const db = await openDB<LocalDb>("localDb", dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
            if (oldVersion == 0) {
                const dateStore = db.createObjectStore('dates', { keyPath: "date" })
                dateStore.createIndex('by-memo', 'memo')
                const taskStore = db.createObjectStore('tasks')
                taskStore.createIndex('by-description', 'description')
            }
        },
        blocked() {
            db.close()
            messageApi.error('Another page is conflicting with current, please close it and try again.')
        },
        blocking() {
            db.close()
            messageApi.warning('Database is outdated, please reload the page.')
        },
    })

    return db
}
export default dbHandler()