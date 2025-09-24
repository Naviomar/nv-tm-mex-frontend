---
title: Freight Forwarders – Catálogo
summary: Catálogo de freight forwarders utilizados en operaciones de import/export.
order: 4
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-freight-forwarders
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de freight forwarders con información de contacto, RFC, país, grupo de freight y dirección.

# Alcance
Incluye alta, edición, búsqueda de freight forwarders similares, asociación a país y grupo de freight, y restauración de registros eliminados.

# Prerrequisitos
- Permisos: `catalogs.freightForwarders.manage`
- Catálogos relacionados: **Countries**, **Freight Groups**, **Banks**, **Currencies**

# Navegación
- Menú: `Configuration → Freight Forwarders`
- Ruta: `/configuration/freight-forwarders`

# Flujo general
1. Crear/editar un freight forwarder
2. Validar nombre, RFC y datos de contacto
3. Buscar freight forwarders con nombre similar para evitar duplicados
4. Asociar país y grupo de freight si aplica
5. Guardar y notificar
6. Usar en módulos de import/export

> **Nota:** antes de crear un nuevo freight forwarder, revisa nombres similares para mantener consistencia y evitar duplicados.

## Vistas principales
- **Listado** con filtros por nombre, RFC y país.
- **Formulario** de alta/edición:
  - Campos: Nombre, RFC, Contact Name, Contact Phone, País, Freight Group, Dirección, Estado, Código Postal
  - Botones: Guardar, Cancelar, Buscar similares
- **Detalle** con relaciones (bancos, emails, grupo de freight)

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **RFC** *(opcional)*  
- **Contact Name** *(obligatorio)*  
- **Contact Phone** *(obligatorio)*  
- **País** *(opcional, selección de catálogo)*  
- **Freight Group** *(opcional, selección de catálogo)*  
- **Dirección** *(opcional)*  
- **Estado** *(opcional)*  
- **Código Postal** *(opcional)*  

## Acciones especiales
- **Buscar similares**: muestra freight forwarders con nombres parecidos antes de guardar
- **Soft delete**: permite eliminar y restaurar freight forwarders y sus emails
- **Gestión de emails**: agregar/eliminar emails asociados

## Errores comunes
- Nombre duplicado
- RFC duplicado
- Información de contacto incompleta o inválida
- Intentar eliminar un freight forwarder que tiene relaciones activas sin revisar
