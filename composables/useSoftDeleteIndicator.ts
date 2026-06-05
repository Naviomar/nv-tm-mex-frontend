/**
 * Composable for handling soft-delete indicators in the UI
 * 
 * This composable provides utilities to check if records are soft-deleted
 * and display appropriate visual indicators to users.
 */

export interface SoftDeleteInfo {
  is_deleted?: boolean
  deleted_at?: string | null
  deleted_by?: number | null
  deleted_info?: {
    deleted_at?: string
    deleted_by?: number
    deleted_by_name?: string | null
  }
}

export const useSoftDeleteIndicator = () => {
  /**
   * Check if a record is soft-deleted
   */
  const isDeleted = (record: SoftDeleteInfo | null | undefined): boolean => {
    if (!record) return false
    return record.is_deleted === true || !!record.deleted_at
  }

  /**
   * Get deleted at timestamp
   */
  const getDeletedAt = (record: SoftDeleteInfo | null | undefined): string | null => {
    if (!record) return null
    return record.deleted_info?.deleted_at || record.deleted_at || null
  }

  /**
   * Get deleted by user ID
   */
  const getDeletedBy = (record: SoftDeleteInfo | null | undefined): number | null => {
    if (!record) return null
    return record.deleted_info?.deleted_by || record.deleted_by || null
  }

  /**
   * Get deleted by user name
   */
  const getDeletedByName = (record: SoftDeleteInfo | null | undefined): string | null => {
    if (!record) return null
    return record.deleted_info?.deleted_by_name || null
  }

  /**
   * Get CSS class for deleted records
   */
  const getDeletedClass = (record: SoftDeleteInfo | null | undefined): string => {
    return isDeleted(record) ? 'deleted-record' : ''
  }

  /**
   * Get row class for v-data-table
   */
  const getRowClass = (item: SoftDeleteInfo): string => {
    return isDeleted(item) ? 'deleted-row' : ''
  }

  /**
   * Format deleted message for display
   */
  const getDeletedMessage = (record: SoftDeleteInfo | null | undefined): string => {
    if (!isDeleted(record)) return ''
    
    const deletedAt = getDeletedAt(record)
    const deletedByName = getDeletedByName(record)
    
    let message = 'Este registro ha sido eliminado'
    
    if (deletedAt) {
      const date = new Date(deletedAt)
      const formatted = date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      message += ` el ${formatted}`
    }
    
    if (deletedByName) {
      message += ` por ${deletedByName}`
    }
    
    return message + '.'
  }

  /**
   * Show alert for deleted records
   */
  const showDeletedAlert = (record: SoftDeleteInfo | null | undefined): boolean => {
    return isDeleted(record)
  }

  return {
    isDeleted,
    getDeletedAt,
    getDeletedBy,
    getDeletedByName,
    getDeletedClass,
    getRowClass,
    getDeletedMessage,
    showDeletedAlert,
  }
}
