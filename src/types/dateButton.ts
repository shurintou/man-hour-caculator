export interface DateButtonProp {
    type: 'prev-month' | 'current-month' | 'next-month',
    isSelected: boolean,
    day: string,
    date: Date,
}

