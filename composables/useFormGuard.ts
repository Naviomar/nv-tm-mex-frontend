export const useFormGuard = (meta: any) => {
    const isFormDirty = ref(false);
    const router = useRouter();

    // Watch the form's dirty state
    watch(() => meta.dirty, (newValue) => {
        isFormDirty.value = newValue;
    });

    // Add the navigation guard
    const addFormGuard = () => {
        console.log('addFormGuard');
        console.log(isFormDirty.value);
        router.beforeEach((to, from, next) => {
            if (isFormDirty.value) {
                const answer = window.confirm('You have unsaved changes. Do you really want to leave?');
                if (answer) {
                    next(); // Allow navigation
                } else {
                    next(false); // Prevent navigation
                }
            } else {
                next(); // Allow navigation if no unsaved changes
            }
        });
    };

    return { addFormGuard };
};