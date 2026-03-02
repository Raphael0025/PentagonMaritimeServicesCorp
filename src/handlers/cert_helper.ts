import { certVersion } from '@/types/certification'

export const sortByCreatedAt = (versions: certVersion[]): certVersion[] =>
    [...versions].sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())

export const removeVersion = (
    versions: certVersion[],
    versionNumber: string
): certVersion[] => versions.filter(v => v.version_number !== versionNumber)

export const reassignActiveVersion = (versions: certVersion[], deletedIndex: number): certVersion[] => {
    if (versions.length === 0) return []

    // Scenario 1: only one left → make active
    if (versions.length === 1) {
        return [{ ...versions[0], status: "active" }]
    }

    // Reset all to archived
    const reset: certVersion[] = versions.map(v => ({ ...v, status: "archived" }))

    // Scenario 2: activate previous version
    const newActiveIndex = deletedIndex - 1 >= 0 ? deletedIndex - 1 : reset.length - 1

    reset[newActiveIndex].status = "active"

    return reset
}