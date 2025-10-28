---
title: Embalajes – Introducción
summary: Catálogo de embalajes para operaciones logísticas y comerciales.
order: 4
status: stable
version: 1.0.0
updatedAt: 2025-09-24
module: configuration-embalajes
roles: [Administrador, Operaciones]
tags: [configuracion, embalajes, catalogos, logistica, permisos]
---

# Objetivo
Contar con un catálogo centralizado de **embalajes** (pallets, cajas, contenedores, etc.), que sirva como referencia en los procesos logísticos y de facturación.  
Este catálogo evita duplicados, garantiza la uniformidad en los registros y facilita la trazabilidad de mercancías.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar embalajes.
- Valida que no existan embalajes duplicados en nombre.
- Controla accesos mediante permisos específicos.
- Registra todas las acciones de creación, edición e inhabilitación.

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.
- Tener configurados previamente catálogos relacionados (Customers, Invoices, Charges).

# Navegación
- Menú principal: **Configuration → Embalajes**
- Ruta directa: `/configuration/embalajes`

# Flujo general de uso
1. Ingresa al módulo de **Embalajes** desde el menú de configuración.
2. Para agregar un embalaje, haz clic en **Nuevo embalaje** y completa los campos requeridos.
3. El sistema validará que no exista un embalaje con el mismo nombre.
4. Usa el buscador para filtrar embalajes por nombre o código.
5. Si necesitas editar o inhabilitar un embalaje, selecciona la opción correspondiente en la lista.
6. Los embalajes inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear un embalaje nuevo, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los embalajes registrados con filtros de búsqueda.
- **Formulario:** Permite agregar o editar embalajes, con validaciones en tiempo real.
- **Validación de similares:** Sugiere embalajes con nombres parecidos antes de confirmar el guardado.

## Campos y validaciones
- **Nombre:** Obligatorio y único.
- **Código:** Opcional, alfanumérico.

---

## Casos de uso
- **Crear embalaje:** Ingresa nombre y opcionalmente código. El sistema valida duplicados antes de guardar.
- **Editar embalaje:** Modifica los datos de un embalaje existente con las mismas validaciones.
- **Inhabilitar embalaje:** Marca el embalaje como inactivo, conservando su historial.
- **Reactivar embalaje:** Vuelve a habilitar un embalaje previamente inhabilitado.
- **Buscar embalaje:** Usa filtros por nombre o código.

---

## Permisos necesarios
- **Ver embalajes:** `embalajes-view`
- **Crear embalaje:** `embalajes-create`
- **Editar embalaje:** `embalajes-edit`
- **Eliminar o restaurar embalaje:** `embalajes-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un embalaje con este nombre.
- **Nombre vacío:** El campo nombre no puede estar vacío.
- **Permisos insuficientes:** El usuario no tiene autorización.
- **Error de servidor:** No fue posible procesar la solicitud.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada embalaje.
- Fechas de creación, actualización e inhabilitación.
