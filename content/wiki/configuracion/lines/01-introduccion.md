---
title: Lines – Catálogo
summary: Catálogo de líneas de transporte (Freight Lines) y agentes (Freight Agents) para operaciones de import/export.
order: 6
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-lines
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de líneas de transporte y agentes, incluyendo información de contacto, país, dirección y códigos asociados.

# Alcance
Incluye alta, edición, búsqueda de líneas similares, gestión de direcciones, bancos, emails y cargos automáticos, así como restauración de registros eliminados.

# Prerrequisitos
- Permisos: `catalogs.lines.manage`
- Catálogos relacionados: **Countries**, **Charges**, **Banks**, **Currencies**

# Navegación
- Menú: `Configuration → Lines`
- Ruta: `/configuration/lines`

# Flujo general
1. Crear/editar una línea o agente
2. Validar nombre, tipo y datos de contacto
3. Buscar líneas con nombre similar para evitar duplicados
4. Asociar país, dirección, banco y cargos automáticos
5. Guardar y notificar
6. Usar en módulos de import/export

> **Nota:** revisa nombres similares antes de crear uno nuevo para mantener consistencia y evitar duplicados.

## Vistas principales
- **Listado** con filtros por nombre, país y tipo (Freight Line o Freight Agent)
- **Formulario** de alta/edición:
  - Campos: Type, Name, Commercial Name, Contact Name, Country, Address, Zip Code, Amacarga Code
  - Botones: Guardar, Cancelar, Buscar similares
- **Detalle** con relaciones:
  - Emails asociados
  - Bancos y cuentas
  - Notas
  - Direcciones
  - Archivos de tránsito interno
  - Cargos automáticos

## Campos y validaciones (resumen)
- **Type** *(obligatorio, selección entre Freight Line o Freight Agent)*  
- **Name** *(obligatorio)*  
- **Commercial Name** *(obligatorio)*  
- **Contact Name** *(opcional)*  
- **Country** *(opcional, selección de catálogo)*  
- **Address** *(opcional)*  
- **Zip Code** *(opcional)*  
- **Amacarga Code** *(opcional, solo para fines internos de Amacarga)*  

## Acciones especiales
- **Buscar similares**: muestra líneas con nombres parecidos antes de guardar
- **Soft delete**: permite eliminar y restaurar líneas y sus relaciones
- **Gestión de direcciones**: agregar, actualizar o eliminar direcciones
- **Gestión de emails**: agregar/eliminar emails asociados
- **Gestión de bancos**: agregar/eliminar cuentas bancarias asociadas
- **Cargos automáticos**: crear, actualizar o eliminar cargos automáticos asociados
- **Archivos de tránsito interno**: cargar y asociar archivos
- **Generación automática de código**: cada línea recibe un código único basado en nombre y fecha

## Errores comunes
- Nombre duplicado
- Código generado duplicado
- Datos de contacto incompletos
- Intentar eliminar línea con relaciones activas sin revisar
- Formulario enviado con campos obligatorios vacíos
