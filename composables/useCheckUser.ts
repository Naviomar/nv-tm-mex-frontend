type User = {
    id: number
    name: string
    email: string
    permissions: []
    roles: []
}

export function useCheckUser() {
    const { isAuthenticated, refreshIdentity } = useSanctumAuth()
    const user = useSanctumUser<User>();
    const snackbar = useSnackbar();

    async function fetchUser() {
        await refreshIdentity()
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
        user, fetchUser, hasPermission, isSuperAdminRole
    };
}
