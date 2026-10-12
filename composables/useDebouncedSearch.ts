/**
 * Runs `run` shortly after the watched value stops changing, so a search box
 * filters while typing without firing one request per keystroke.
 */
export function useDebouncedSearch(source: () => unknown, run: () => unknown, delay = 450) {
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(run, delay)
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })
}
