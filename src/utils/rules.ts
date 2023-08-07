import { reactive } from 'vue'

export const timeModalRuleRef = reactive({
    scheduledWorkHours: [
        {
            pattern: /^(?:\d|1\d|2[0-3])(\.\d{1,2})?$|^24(\.00?)?$/,
            message: 'Hour should be 0 to 24',
            trigger: 'blur',
        },
    ],
    startTime: [
        {
            pattern: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
            message: 'Format is not valid',
            trigger: 'blur',
        },
    ],
    endTime: [
        {
            pattern: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
            message: 'Format is not valid',
            trigger: 'blur',
        },
    ],
    restHours: [
        {
            pattern: /^(?:\d|1\d|2[0-3])(\.\d{1,2})?$|^24(\.00?)?$/,
            message: 'Hour should be 0 to 24',
            trigger: 'blur',
        },
    ],
})

export const timeInputAddonAfter = "hour"
export const timeInputStep = 0.01
export const timeMinuteStep = 5
export const timeValueFormat = 'HHmm'
export const timeDisplayFormat = 'HH:mm'

