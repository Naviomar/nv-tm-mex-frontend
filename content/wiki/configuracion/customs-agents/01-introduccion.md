---
title: Customs Agents – Catálogo
summary: Catálogo de agentes aduanales para operaciones de import/export.
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-customs-agents
roles: [Administrador, Operaciones, Aduana]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de agentes aduanales con información de contacto, patente, agencia y puertos de operación.

# Alcance
Incluye alta, edición, búsqueda de agentes similares, asociación a puertos y restauración de registros eliminados.

# Prerrequisitos
- Permisos: `catalogs.customsAgents.manage`
- Catálogos relacionados: **Ports**

# Navegación
- Menú: `Configuration → Customs Agents`
- Ruta: `/configuration/custom-agents`

# Flujo general
1. Crear/editar agente aduanal
2. Validar nombre y patente
3. Buscar agentes con nombre similar para evitar duplicados
4. Asociar puertos si aplica
5. Guardar y notificar
6. Usar en módulos de import/export

> **Nota:** antes de crear un nuevo agente, revisa agentes con nombres similares para mantener consistencia y evitar duplicados.

## Vistas principales
- **Listado** con filtros por nombre y patente.
- **Formulario** de alta/edición:
  - Campos: Nombre, Patente, Agencia, Puertos
  - Botones: Guardar, Cancelar, Buscar similares
- **Detalle** con relaciones (bancos, emails, puertos)

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Patente** *(obligatorio)*  
- **Agencia** *(opcional)*  
- **Puertos** *(opcional, selección múltiple)*  

## Acciones especiales
- **Buscar similares**: muestra agentes con nombres parecidos antes de guardar
- **Soft delete**: permite eliminar y restaurar agentes

## Errores comunes
- Nombre duplicado
- Patente duplicada
- Información de contacto inválida
- Intentar eliminar un agente que tiene relaciones activas sin revisar
