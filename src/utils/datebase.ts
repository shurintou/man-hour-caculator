import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { TaskTable, DateTable } from '@/types/index'
import { message } from 'ant-design-vue'
const [messageApi] = message.useMessage()



interface LocalDb extends DBSchema {
    'dates': {
        key: Date
        value: DateTable
    }
    'tasks': {
        key: number
        value: TaskTable
    }
}

const dbVersion = 1
async function dbHandler() {
    const db = await openDB<LocalDb>("localDb", dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
            if (oldVersion == 0) {
                db.createObjectStore('dates', { keyPath: "date" })
                db.createObjectStore('tasks')
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