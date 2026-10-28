type User = {
    id: number
    name: string
    email: string
    permissions: []
    roles: []
    // Efectivos (roles + directos - revocados), calculados por el backend.
    permission_names?: string[]
    permission_revocations?: { permission_id: number }[]
    departments?: { name: string }[]
}

/**
 * What a button, form or page requires. A string is one permission, an array requires ALL of
 * them, and `{ any: [...] }` requires at least one (e.g. `a|b` alternatives in the backend).
 * `{ any, all }` can be combined.
 */
export type PermissionSpec = string | string[] | { any?: string[]; all?: string[] }

const MARITIME_IMPORT_DEPARTMENT = 'Maritime Import'
const MARITIME_EXPORT_DEPARTMENT = 'Maritime Export'

// Module-scoped (not per-call) so concurrent mounts (e.g. MainMenu + a catalog
// table on the same page) share one in-flight request instead of firing one each.
let isRestrictedFetchPromise: Promise<void> | null = null

export function useCheckUser() {
    const { isAuthenticated, refreshIdentity } = useSanctumAuth()
    const user = useSanctumUser<User>();
    const snackbar = useSnackbar();
    const isRestricted = useState<boolean | null>('user-is-restricted', () => null)
    const allowedConsigneeIds = useState<number[]>('user-allowed-consignee-ids', () => [])

    async function fetchUser() {
        await refreshIdentity()
    }

    function resetIsRestricted() {
        isRestricted.value = null
        allowedConsigneeIds.value = []
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
                allowedConsigneeIds.value = (response?.direct_customers ?? []).map((c: any) => c.id)
            } catch (e) {
                // Leave isRestricted null (rather than assuming unrestricted) so the
                // next mount retries instead of failing open for the rest of the session.
            } finally {
                isRestrictedFetchPromise = null
            }
        })()

        return isRestrictedFetchPromise
    }

    // Per-row visibility check for reference tables: a restricted user can still view
    // references belonging to a consignee assigned to their allowed executives/customers,
    // and references sourced from Chile are always visible regardless of restriction.
    function canViewReference(item: any): boolean {
        if (!isRestricted.value) return true
        if (item?.country_code === 'CL') return true

        const consigneeId = item?.consignee_id ?? item?.consignee?.id
        if (!consigneeId) return false

        return allowedConsigneeIds.value.includes(consigneeId)
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
        if (!isAuthenticated.value) return false
        if (isSuperAdminRole()) return true

        // El backend ya resta las revocaciones: es la fuente de verdad.
        const effective = user.value?.permission_names
        if (effective) return effective.includes(permissionName)

        // Respaldo para una sesión cargada antes de que existiera permission_names:
        // roles + directos, descontando manualmente los revocados.
        const revokedIds = new Set((user.value?.permission_revocations ?? []).map((r: any) => r.permission_id))
        const hasDirectPermission = user.value?.permissions.some((p: any) => p.name === permissionName && !revokedIds.has(p.id))
        const hasRolePermission = user.value?.roles.some((role: any) =>
            role.permissions.some((p: any) => p.name === permissionName && !revokedIds.has(p.id))
        )
        return hasDirectPermission || hasRolePermission
    }

    const hasAnyPermission = (...names: string[]) => names.some((name) => hasPermission(name))
    const hasAllPermissions = (...names: string[]) => names.every((name) => hasPermission(name))

    // Single entry point for "may this user see/do this?" used by <Can>, the route guard
    // and v-if checks. An empty spec means no restriction.
    function can(spec?: PermissionSpec | null): boolean {
        if (spec === undefined || spec === null) return true
        if (typeof spec === 'string') return hasPermission(spec)
        if (Array.isArray(spec)) return hasAllPermissions(...spec)
        const anyOk = !spec.any?.length || hasAnyPermission(...spec.any)
        const allOk = !spec.all?.length || hasAllPermissions(...spec.all)
        return anyOk && allOk
    }

    // Voyages catalog: IMPO-only users manage 'I' voyages, EXPO-only users manage 'E'
    // voyages; users in both (or neither) maritime department keep seeing everything.
    // Mirrors the backend's VoyageDepartmentScopeService::allowedImpoExpo().
    const allowedVoyageImpoExpo = computed<string[] | null>(() => {
        const departmentNames = (user.value?.departments ?? []).map((d: any) => d.name?.trim())
        const isImport = departmentNames.includes(MARITIME_IMPORT_DEPARTMENT)
        const isExport = departmentNames.includes(MARITIME_EXPORT_DEPARTMENT)

        if (isImport && !isExport) return ['I']
        if (isExport && !isImport) return ['E']
        return null
    })

    return {
        isCurrentUser,
        checkUserAndNotify,
        checkUserAndExecute,
        user, fetchUser, hasPermission, hasAnyPermission, hasAllPermissions, can, isSuperAdminRole, isAdminRole,
        isRestricted, fetchIsRestricted, resetIsRestricted, canViewReference,
        allowedVoyageImpoExpo
    };
}
