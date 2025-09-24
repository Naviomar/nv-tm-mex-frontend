export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [] as any[],
        isFetching: false
    }),
    getters: {
        getUsers(state) {
            return state.users
        },
        emptyUsers(state) {
            return state.users.length === 0
        },
        getUserById: (state) => (id: number | string | null) => {
            return state.users.find((user) => user.id === id) || null
        },
    },
    actions: {
        async fetchUsers($api: any) {
            if (this.isFetching) return // Prevent concurrent fetches
            if (!this.emptyUsers) return // Prevent fetching if users are already loaded

            this.isFetching = true
            try {
                const response = await $api.users.getAllUsersInfo()
                this.users = response
            } catch (error) {
                console.error('Failed to fetch users:', error)
            } finally {
                this.isFetching = false
            }
        },
        async ensureUsers($api: any) {
            if (this.emptyUsers) {
                await this.fetchUsers($api)
            }
        },
    },
})