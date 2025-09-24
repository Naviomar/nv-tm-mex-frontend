export const useApiErrorStore = defineStore('errorApiStore', () => {
    const errorStack = ref<any>([])

    const addError = (response: any) => {
        console.warn('🚀 ~ file: errorApiStore.ts ~ line 10 ~ addError ~ response', response)
        if (!errorStack.value) {
            errorStack.value = []
        }
        errorStack.value.push(response)
    }

    const clearErrors = () => {
        errorStack.value = []
    }

    const clearError = (index: number) => {
        errorStack.value.splice(index, 1)

    }

    const hasErrors = computed(() => {
        if (!errorStack.value) {
            return false
        }
        return errorStack.value.length > 0
    })

    return {
        errorStack,
        addError,
        clearErrors,
        clearError,
        hasErrors,
    }
})