export function useLoading() {
  const loading = ref(false);
  const start = () => {
    loading.value = true;
  };
  const stop = () => {
    setTimeout(() => {
      loading.value = false;
    }, 200);
  };
  return {
    loading,
    start,
    stop
  };
}