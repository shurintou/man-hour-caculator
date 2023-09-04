import { ref, reactive, computed, watch, } from 'vue'
import { type mode } from '@/types/index'
import type { UnwrapRef } from 'vue'
import { useModeStore } from '@/stores/mode'

export function useFormWatcher<T extends object>(mode: mode, formStateObj: T) {
    const modeStore = useModeStore()

    const formState: UnwrapRef<T> = reactive(formStateObj) as UnwrapRef<T>
    const isEditing = computed(() => modeStore.currentMode === mode)
    const isFormStateModified = ref<boolean>(false)

    watch(formState, () => { if (isEditing.value === true) isFormStateModified.value = true })

    return { formState, isEditing, isFormStateModified }
}