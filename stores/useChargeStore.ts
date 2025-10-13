export const useChargeStore = defineStore('charges', {
    state: () => ({
        charges: [] as any[],
        isFetching: false
    }),
    getters: {
        getCharges(state) {
            return state.charges
        },
        emptyCharges(state) {
            return state.charges.length === 0
        },
        getChargeById: (state) => (id: number | string | null) => {
            return state.charges.find((charge) => charge.id === id) || null
        },
    },
    actions: {
        async fetchCharges($api: any) {
            if (this.isFetching) return // Prevent concurrent fetches
            if (!this.emptyCharges) return // Prevent fetching if charges are already loaded

            this.isFetching = true
            try {
                const response = await $api.charges.getAllChargesInfo()
                this.charges = response
            } catch (error) {
                console.error('Failed to fetch charges:', error)
            } finally {
                this.isFetching = false
            }
        },
        async ensureCharges($api: any) {
            if (this.emptyCharges) {
                await this.fetchCharges($api)
            }
        },
    },
})