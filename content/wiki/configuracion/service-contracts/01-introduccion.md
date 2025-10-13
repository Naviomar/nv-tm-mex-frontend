---
title: Service Contracts – Introducción
summary: Catálogo de contratos de servicio asociados a líneas de transporte.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-services-contracts
roles: [Administrador, Operaciones]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de contratos de servicio vinculados a líneas para control de operaciones y seguimiento.

# Alcance
Incluye alta, edición, búsqueda, inhabilitación y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.servicesContracts.manage`
- Catálogos relacionados: **Lines**

# Navegación
- Menú: `Configuration → Service Contracts`
- Ruta: `/configuration/services-contracts`

# Flujo general
1. Crear/editar contrato
2. Verificar coincidencias de nombre
3. Guardar y notificar
4. Usar en módulos de logística y facturación

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo contrato.

## Vistas principales
- **Listado** con filtros por nombre y línea.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (línea asociada, historial de cambios)

## Campos y validaciones (resumen)
- **Nombre del contrato** *(obligatorio)*  
- **Línea asociada** *(opcional, por catálogo de Lines)*  

## Errores comunes
- Nombre duplicado.
- Línea inexistente o inválida.
