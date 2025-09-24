export default defineNuxtRouteMiddleware((to, from) => {
    // const { refreshIdentity } = useSanctumAuth();
    // console.log('Auth refresh middleware');
    // useVisibility(async () => {
    //     try {
    //         if (import.meta.server) return

    //         await refreshIdentity(); // This will refresh the user state
    //         // If successful, the user is still authenticated
    //     } catch (error) {
    //         // If an error occurs, it might be due to an expired session
    //         console.error('User session expired, redirecting to login');
    //         return navigateTo('/system/auth/login');
    //     }
    // });
});