// Agrupa el catálogo plano de permisos ("customs-agents-view") en módulo > submódulo
// > etiqueta legible. Compartido por UserAccessPanel y RolePermissionsPanel para que ambos
// muestren la misma jerarquía.

export interface RawPermission {
  id: number
  name: string
  [key: string]: any
}

export interface PermissionNode {
  id: number
  name: string
  humanLabel: string
  description?: string | null
}

export interface PermissionSubGroup {
  label: string
  permissions: PermissionNode[]
}

export interface PermissionGroup {
  label: string
  subgroups: PermissionSubGroup[]
}

export const ROOT_SUBGROUP = '__root__'

// Acepta '-' y '.' como separadores.
const normalize = (name: string): string[] => name.split(/[-.]/)

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const humanize = (str: string): string => str.split(/[-.]/).map(capitalize).join(' ')

export function groupPermissions(perms: RawPermission[]): PermissionGroup[] {
  // Un submódulo sólo existe si su prefijo de 2 segmentos se repite
  const prefixCount: Record<string, number> = {}
  for (const p of perms) {
    const parts = normalize(p.name)
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`
      prefixCount[key] = (prefixCount[key] ?? 0) + 1
    }
  }

  const groupMap: Record<string, Record<string, PermissionNode[]>> = {}

  for (const p of perms) {
    const parts = normalize(p.name)
    const groupLabel = humanize(parts[0])

    let subLabel = ROOT_SUBGROUP
    if (parts.length >= 2 && prefixCount[`${parts[0]}-${parts[1]}`] >= 2) {
      subLabel = humanize(parts[1])
    }

    if (!groupMap[groupLabel]) groupMap[groupLabel] = {}
    if (!groupMap[groupLabel][subLabel]) groupMap[groupLabel][subLabel] = []

    // La etiqueta es todo menos el prefijo ya usado como módulo/submódulo
    let labelParts = parts.slice(1)
    if (subLabel !== ROOT_SUBGROUP) labelParts = parts.slice(2)
    const humanLabel = (labelParts.length > 0 ? labelParts : [parts[parts.length - 1]]).map(capitalize).join(' ')

    groupMap[groupLabel][subLabel].push({ id: p.id, name: p.name, humanLabel, description: p.description })
  }

  return Object.entries(groupMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, subs]) => ({
      label,
      subgroups: Object.entries(subs)
        .sort(([a], [b]) => {
          if (a === ROOT_SUBGROUP) return -1
          if (b === ROOT_SUBGROUP) return 1
          return a.localeCompare(b)
        })
        .map(([subLabel, permissions]) => ({ label: subLabel, permissions })),
    }))
}
