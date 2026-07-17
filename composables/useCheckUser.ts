type User = {
    id: number
    name: string
    email: string
    permissions: []
    roles: []
}

// Module-scoped (not per-call) so concurrent mounts (e.g. MainMenu + a catalog
// table on the same page) share one in-flight request instead of firing one each.
let isRestrictedFetchPromise: Promise<void> | null = null

export function useCheckUser() {
    const { isAuthenticated, refreshIdentity } = useSanctumAuth()
    const user = useSanctumUser<User>();
    const snackbar = useSnackbar();
    const isRestricted = useState<boolean | null>('user-is-restricted', () => null)

    async function fetchUser() {
        await refreshIdentity()
    }

    function resetIsRestricted() {
        isRestricted.value = null
        isRestrictedFetchPromise = null
    }

    async function fetchIsRestricted() {
        if (!isAuthenticated.value) {
            resetIsRestricted()
            return
        }
        if (isRestricted.value !== null) return
        if (isRestrictedFetchPromise) return isRestrictedFetchPromise

        isRestrictedFetchPromise = (async () => {
            try {
                const { $api } = useNuxtApp()
                const response: any = await $api.userDataRestrictions.getMySummary()
                isRestricted.value = !!response?.is_restricted
            } catch (e) {
                // Leave isRestricted null (rather than assuming unrestricted) so the
                // next mount retries instead of failing open for the rest of the session.
            } finally {
                isRestrictedFetchPromise = null
            }
        })()

        return isRestrictedFetchPromise
    }

    const isCurrentUser = (id: number | string): boolean => {
        if (!isAuthenticated.value) {
            return false;
        }
        return user.value!.id === id;
    };

    const checkUserAndNotify = (id: number | string) => {
        if (import.meta.client) {
            if (!isCurrentUser(id)) {
                snackbar.add({ type: 'error', text: 'You are not the owner of this resource.' })
            }
        }

        return isCurrentUser(id);
    };

    const checkUserAndExecute = (id: number | string, callback: Function) => {
        if (!isCurrentUser(id)) {
            snackbar.add({ type: 'error', text: 'You are not the owner of this resource.' })
            return;
        }
        callback();
    };

    const isSuperAdminRole = () => {
        return user.value?.roles.some((role: any) => role.name === 'Super Admin')
    }

    const isAdminRole = () => {
        return user.value?.roles.some((role: any) =>
            ['Super Admin', 'Admin', 'IT Admin'].includes(role.name)
        )
    }

    function hasPermission(permissionName: string) {
        // console.log('hasPermission user', user.value)
        // console.log('user roles', user.value?.roles)
        if (!isAuthenticated.value) return false
        if (isSuperAdminRole()) return true

        const hasDirectPermission = user.value?.permissions.some((p: any) => p.name === permissionName)
        const hasRolePermission = user.value?.roles.some((role: any) =>
            role.permissions.some((p: any) => p.name === permissionName)
        )
        return hasDirectPermission || hasRolePermission
    }

    return {
        isCurrentUser,
        checkUserAndNotify,
        checkUserAndExecute,
        user, fetchUser, hasPermission, isSuperAdminRole, isAdminRole,
        isRestricted, fetchIsRestricted, resetIsRestricted
    };
}
