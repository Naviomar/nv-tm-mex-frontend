export function useCopyToClipboard() {
    const snackbar = useSnackbar()
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            snackbar.add({
                text: "Copied to clipboard",
                type: "success",
            })
        }
        ).catch((err) => {
            snackbar.add({ text: "Failed to copy text", type: "error" })
            console.error("Failed to copy text: ", err)
        })
    }

    return { copyToClipboard }
}