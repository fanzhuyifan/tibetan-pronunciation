import { useRef, useCallback, ChangeEvent } from 'react'
import { gzip, ungzip } from 'pako'

interface DeckInterface {
    exportYaml: () => string;
    importYaml: (text: string) => boolean;
}

// Encapsulates deck YAML import/export behaviors for reuse and to keep views lean.
export function useDeckImportExport(deck: DeckInterface) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isGzipBytes = useCallback((bytes: Uint8Array) => bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b, [])

    const handleExport = useCallback(() => {
        try {
            if (!deck?.exportYaml) throw new Error('Deck export unavailable')

            const yaml = deck.exportYaml()
            const compressed = gzip(new TextEncoder().encode(yaml))
            const blob = new Blob([compressed], { type: 'application/gzip' })
            const url = URL.createObjectURL(blob)

            const anchor = document.createElement('a')
            anchor.href = url
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            anchor.download = `tibetan-pronunciation-progress-${timestamp}.yaml.gz`
            anchor.click()

            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to export deck', error)
            window.alert('Unable to export deck. Please try again.')
        }
    }, [deck])

    const handleImportFile = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) return

            try {
                const buffer = new Uint8Array(await file.arrayBuffer())
                const shouldDecompress = file.name.endsWith('.gz') || file.type === 'application/gzip' || isGzipBytes(buffer)

                const payload = shouldDecompress
                    ? new TextDecoder().decode(ungzip(buffer))
                    : new TextDecoder().decode(buffer)

                const ok = deck?.importYaml?.(payload)
                if (!ok) throw new Error('Deck import returned false')
            } catch (error) {
                console.error('Failed to import deck', error)
                window.alert('Unable to import deck. Please verify the YAML file and try again.')
            } finally {
                if (event.target) event.target.value = ''
            }
        },
        [deck, isGzipBytes],
    )

    const triggerImport = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    return {
        fileInputRef,
        triggerImport,
        handleExport,
        handleImportFile
    }
}
