---
title: Banks – Introducción
summary: Catálogo de bancos.
order: 1
status: stable
version: 1.2.0
updatedAt: 2025-09-15
module: configuration-banks
roles: [Administrador, Finanzas]
tags: [configuracion, bancos, catalogos, finanzas, permisos]
---

# Objetivo
Contar con un catálogo centralizado de nombres de bancos por país, que sirva como referencia para seleccionar bancos en otros módulos del sistema. Este catálogo facilita la selección de bancos en formularios y registros, asegurando que la información esté actualizada y sea consistente en todo el sistema.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar bancos.
- Valida que no existan bancos duplicados y que los campos obligatorios estén completos.
- El acceso a las funciones está controlado por permisos específicos.
- Se registra quién crea, edita o elimina cada banco para mayor seguridad y control.

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.
- Es necesario tener el catálogo de países actualizado, ya que cada banco debe estar asociado a un país.

# Navegación
- Menú principal: **Configuration → Banks**
- Ruta directa: `/configuration/banks`

# Flujo general de uso
1. Ingresa al módulo de Bancos desde el menú de configuración.
2. Para agregar un banco, haz clic en "Nuevo banco" y completa los campos requeridos.
3. Antes de guardar, el sistema validará que no exista un banco con el mismo nombre en el país seleccionado.
4. Puedes buscar bancos existentes usando los filtros por nombre, código o país.
5. Si necesitas editar o inhabilitar un banco, selecciona la opción correspondiente en la lista.
6. Los bancos inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear un nuevo banco, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los bancos registrados, con opciones de filtro y búsqueda.
- **Formulario:** Permite agregar o editar bancos, con validaciones en tiempo real.
- **Detalle:** Visualiza información completa y relaciones del banco seleccionado.

## Campos y validaciones
- **Nombre:** Obligatorio y único por país.
- **Código:** Obligatorio, alfanumérico y máximo 10 caracteres.
- **País:** Obligatorio.

---

## Casos de uso
- **Crear banco:** Ingresa nombre, código y país. El sistema valida duplicados antes de guardar.
- **Editar banco:** Modifica los datos de un banco existente con las mismas validaciones.
- **Inhabilitar banco:** Marca el banco como inactivo, pero conserva su historial.
- **Reactivar banco:** Permite volver a habilitar un banco previamente inhabilitado.
- **Buscar banco:** Utiliza los filtros para encontrar bancos por nombre, código o país.

---

## Permisos necesarios
Para realizar acciones en el módulo de Bancos, necesitas los siguientes permisos:
- **Ver bancos:** `banks-view`
- **Crear banco:** `banks-create`
- **Editar banco:** `banks-edit`
- **Eliminar o restaurar banco:** `banks-delete`

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.

---

## Errores comunes
- **Nombre duplicado:** Ya existe un banco con este nombre en el país seleccionado.
- **Código vacío o inválido:** El código debe ser alfanumérico y no puede estar vacío.
- **País no seleccionado:** Debes elegir un país para continuar.
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada banco.
- Fechas de creación, actualización e inhabilitación.

Esto permite mantener un historial claro y seguro de todas las acciones realizadas en el catálogo de bancos.