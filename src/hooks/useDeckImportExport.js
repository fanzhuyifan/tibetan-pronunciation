import { useRef, useCallback } from 'react'

// Encapsulates deck YAML import/export behaviors for reuse and to keep views lean.
export function useDeckImportExport(deck) {
    const fileInputRef = useRef(null)

    const handleExport = useCallback(() => {
        try {
            if (!deck?.exportYaml) throw new Error('Deck export unavailable')

            const yaml = deck.exportYaml()
            const blob = new Blob([yaml], { type: 'text/yaml' })
            const url = URL.createObjectURL(blob)

            const anchor = document.createElement('a')
            anchor.href = url
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            anchor.download = `tibetan-pronunciation-progress-${timestamp}.yaml`
            anchor.click()

            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to export deck', error)
            window.alert('Unable to export deck. Please try again.')
        }
    }, [deck])

    const handleImportFile = useCallback(
        async (event) => {
            const file = event.target.files?.[0]
            if (!file) return

            try {
                const text = await file.text()
                const ok = deck?.importYaml?.(text)
                if (!ok) throw new Error('Deck import returned false')
            } catch (error) {
                console.error('Failed to import deck', error)
                window.alert('Unable to import deck. Please verify the YAML file and try again.')
            } finally {
                event.target.value = ''
            }
        },
        [deck],
    )

    const triggerImport = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    return {
        fileInputRef,
        triggerImport,
        handleExport,
        handleImportFile,
    }
}

export default useDeckImportExport