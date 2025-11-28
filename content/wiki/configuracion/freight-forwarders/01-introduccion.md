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
- **Nombre duplicado:** Ya existe un freight forwarder con este nombre.
- **RFC inválido o duplicado:** El número fiscal no es válido o ya está registrado.
- **Campos obligatorios vacíos:** Nombre, contacto o país no pueden estar vacíos.
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada freight forwarder.
- Fechas de creación, actualización e inhabilitación.

Esto permite mantener un historial seguro y confiable de todas las acciones realizadas en el catálogo de freight forwarders.

---

# Catálogo de Freight Forwarders Groups

## Objetivo 

Administrar grupos de agentes de carga (freight forwarders) que permiten agrupar empresas con funciones o características similares.
Esto facilita la organización, segmentación y búsqueda operativa dentro del módulo de Freight Forwarders.

--- 
## Navegación

- Menú principal: **Configuration → Freight Forwarders Groups**
- Ruta directa: `/configuration/freight-forwarders/groups`

---

## Vistas principales

**Listado**

Presenta todos los grupos registrados con la siguiente información:

- Nombre del grupo

- Lista de freight forwarders asociados

- Fecha de creación

- Acciones disponibles

**Acciones rápidas**

Permite realizar las siguientes acciones por grupo:

- View: Ver detalle del grupo y sus freight forwarders asociados.

- Delete / Restore: Inactivar o reactivar un grupo.

**Búsqueda**

Incluye un filtro por nombre del grupo, con opciones para:

- Search: Ejecutar la búsqueda.

- Clear: Limpiar filtros y restablecer resultados.

---

## Flujo de uso

1. Ingresar al submódulo Freight Forwarders Groups.

2. Escribir el nombre del grupo en el campo de búsqueda y presionar Search.

3. Consultar los resultados en la tabla principal.

4. Seleccionar View para revisar los freight forwarders asociados.

5. Utilizar Delete para inactivar un grupo o Restore para reactivarlo.

6. Cambiar de página mediante la paginación ubicada en la parte inferior.

7. Usar Clear para limpiar los filtros en cualquier momento.

--- 

## Campos y validaciones

| Campo                    | Descripción                              | Validación                 |
| ------------------------ | ---------------------------------------- | -------------------------- |
| **F.F. Group (Name)**    | Nombre del grupo de *freight forwarders* | Obligatorio y único        |
| **Freight forwarder(s)** | Lista de empresas asociadas al grupo     | Automático según relación  |
| **Created at**           | Fecha de creación del registro           | Generada automáticamente   |
| **Acciones**             | Ver o eliminar grupos                    | Según permisos del usuario |

--- 

## Casos de uso 

1. Buscar grupo: Localizar grupos de freight forwarders mediante el filtro por nombre.

2. Ver detalle: Consultar los freight forwarders asociados a un grupo específico.

3. Eliminar grupo: Inhabilitar un grupo con confirmación previa.

4. Reactivar grupo: Restaurar un grupo eliminado desde la administración.

--- 

## Crear Freight Forwarder Group

**Objetivo**

Permitir la creación de nuevos grupos de agentes de carga, asegurando que los nombres no se repitan y manteniendo la coherencia en las asociaciones.

## Flujo de creación

1. Acceder a Freight Forwarders → Freight Forwarders Groups → Nuevo grupo.
2. Completar los campos obligatorios:
    - Name Group*
    - Code (opcional)
3. Hacer clic en Save para validar la información.
4. El sistema verificará la existencia de grupos similares.
5. Confirmar para crear el grupo o cancelar para modificar los datos.
6. Al guardarse correctamente, se mostrará un mensaje de éxito.

--- 
## Funciones adicionales

- Search similar: Busca grupos con nombres similares antes de guardar.
- Cancel: Regresa al listado de grupos sin guardar cambios.
- Save: Valida y registra el grupo, siempre que no haya duplicados.

---

## Errores comunes

| Error                    | Descripción                                           |
| ------------------------ | ----------------------------------------------------- |
| **Name vacío**           | No se permite guardar sin un nombre.                  |
| **Grupo duplicado**      | Se detectan coincidencias y se solicita confirmación. |
| **Validación pendiente** | Intento de guardar sin verificar similitudes.         |

---

## Permisos necesarios

| Acción                     | Permiso                          |
| -------------------------- | -------------------------------- |
| Ver grupos                 | `freightforwardersgroups-view`   |
| Crear grupo                | `freightforwardersgroups-create` |
| Editar grupo               | `freightforwardersgroups-edit`   |
| Eliminar o restaurar grupo | `freightforwardersgroups-delete` |

---

## Auditoría

El sistema mantiene registro de:

- Usuario que creó, editó o eliminó un grupo.
- Fechas de creación, modificación y validación.
- Historial de reactivaciones.

