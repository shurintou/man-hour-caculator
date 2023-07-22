import { defineStore } from 'pinia'
import { Dayjs } from 'dayjs'

export const useDateStore = defineStore('date', {
  state: () => {
    return {
      selectedDateList: [] as Dayjs[]
    }
  },
})
