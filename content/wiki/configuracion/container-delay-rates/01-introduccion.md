---
title: Container Delay Rates – Introducción
summary: Catálogo de tarifas por retraso de contenedores.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-container-delay-rates
roles: [Administrador, Operaciones, Finanzas]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener las tarifas aplicables por retraso en la devolución de contenedores.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.containerDelayRates.manage`
- Catálogos relacionados: **Containers**

# Navegación
- Menú: `Configuration → Container Delay Rates`
- Ruta: `/configuration/container-delay-rates`

# Flujo general
1. Crear/editar tarifa por retraso
2. Validar contenedor y valor
3. Guardar y notificar
4. Usar en módulos de facturación y operaciones

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo registro.

## Vistas principales
- **Listado** con filtros por contenedor y tarifa.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (operaciones, clientes)

## Campos y validaciones (resumen)
- **Contenedor** *(obligatorio)*  
- **Tarifa por día retrasado** *(obligatorio)*  
- **Moneda** *(obligatorio)*  

## Errores comunes
- Contenedor duplicado.
- Tarifa inválida.
