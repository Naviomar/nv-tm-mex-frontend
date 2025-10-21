---
title: Service Contracts – Introducción
summary: Catálogo de contratos de servicio asociados a líneas de transporte.
order: 9
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-service-contracts
roles: [Administrador, Operaciones, Comercial]
tags: [configuracion, service-contracts, contratos, lines, permisos]
---

# Objetivo
Contar con un catálogo centralizado de contratos de servicio vinculados a líneas de transporte, que permita una gestión organizada, segura y trazable de acuerdos comerciales.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar contratos.
- Cada contrato está asociado a una línea de transporte.
- Incluye validaciones para evitar duplicados mediante coincidencias de nombre.
- El acceso a funcionalidades está controlado por permisos específicos.
- Mantiene registro de auditoría para control interno.

# Prerrequisitos
- Contar con permisos en el sistema.
- Tener actualizado el catálogo de **Lines**.

# Navegación
- Menú principal: **Configuration → Service Contracts**
- Ruta directa: `/configuration/services-contracts`

# Flujo general de uso
1. Ingresa al módulo de Service Contracts.
2. Haz clic en **Nuevo contrato** para registrar uno nuevo.
3. Completa los campos requeridos: nombre y línea asociada.
4. Antes de guardar, el sistema validará nombres similares.
5. Guarda el contrato si no hay duplicados detectados.
6. Edita o inhabilita contratos desde el listado.
7. Los contratos inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Usa la búsqueda de similares antes de registrar un nuevo contrato.

---

## Vistas principales
- **Listado:** Muestra todos los contratos registrados con filtros por nombre y línea.
- **Formulario:** Crear o editar contratos con validaciones.
- **Detalle:** Visualiza información completa del contrato y su relación con la línea.

## Campos y validaciones
- **Name:** Obligatorio. Texto único.
- **Line:** Obligatorio. Selección desde el catálogo de líneas.

---

## Casos de uso
- **Crear contrato:** Completar campos obligatorios, validar duplicados y guardar.
- **Editar contrato:** Modificar datos de un contrato existente.
- **Inhabilitar contrato:** Marcarlo como inactivo sin eliminar historial.
- **Reactivar contrato:** Recuperar un contrato inhabilitado.
- **Buscar contrato:** Filtrar por nombre o línea asociada.

---

## Permisos necesarios
- **Ver contratos:** `service-contracts-view`
- **Crear contrato:** `service-contracts-create`
- **Editar contrato:** `service-contracts-edit`
- **Eliminar o restaurar contrato:** `service-contracts-delete`

---

## Errores comunes
- **Nombre requerido:** El campo no puede estar vacío.
- **Contrato duplicado:** Existe otro con nombre similar.
- **Línea no seleccionada:** Campo obligatorio faltante.
- **Permisos insuficientes:** El usuario no puede realizar la acción.
- **Error de servidor:** No fue posible procesar la solicitud.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó el contrato.
- Fechas de creación, actualización e inhabilitación.
