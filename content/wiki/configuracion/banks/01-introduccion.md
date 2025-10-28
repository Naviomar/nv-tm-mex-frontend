---
title: Banks – Introducción
summary: Catálogo de bancos para operaciones financieras.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-banks
roles: [Administrador, Finanzas]
tags: [configuracion, bancos, catalogos]
---

# Objetivo
Mantener el catálogo de bancos con su nombre, código y país asociado para operaciones financieras y referencias.

# Alcance
Incluye alta, edición, búsqueda, inhabilitación y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.banks.manage`
- Catálogos relacionados: **Countries**

# Navegación
- Menú: `Configuration → Banks`
- Ruta: `/configuration/banks`

# Flujo general
1. Crear/editar banco
2. Verificar coincidencias de nombre
3. Guardar y notificar
4. Usar en módulos financieros y cuentas de líneas

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo banco.

## Vistas principales
- **Listado** con filtros por nombre, código y país.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (transacciones si aplica).

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Código** *(obligatorio)*  
- **País** *(obligatorio)*  

## Errores comunes
- Nombre duplicado.
- Código vacío o inválido.
