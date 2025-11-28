
export function useVisibility(onVisible: () => void) {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            console.log('Page is visible');
            onVisible();
        }
    };

    onMounted(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    });

    onUnmounted(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
}