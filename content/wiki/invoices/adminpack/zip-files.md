---
title: AdminPack ZIP files history – Introducción
summary: Módulo para visualizar, filtrar y descargar archivos ZIP generados en AdminPack.
order: 14
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: adminpack-zip-jobs
roles: [Administrador, Finanzas]
tags: [adminpack, invoices, zip, historial, export]
---

# Objetivo
Permitir a los usuarios consultar el historial de archivos ZIP generados por AdminPack, revisar su estado de procesamiento y descargar los archivos correspondientes.

# Alcance
- Filtrado por fecha de creación y estado del proceso (Pending o Completed).
- Visualización de resultados en tabla con columnas: Job #, Procesado, ZIP file, Created at.
- Botón para descargar cada archivo ZIP y opción de ver detalles del job.
- Paginación para navegar entre los resultados históricos.

# Prerrequisitos
- Acceso al módulo AdminPack con permisos para consultar archivos ZIP.
- Conocimiento básico de la interfaz de filtros y tabla de resultados.

# Navegación
- Menú principal: **AdminPack → ZIP files history**
- Ruta directa: `/adminpack/zip-file-jobs`

# Flujo general de uso
1. Ingresa al módulo de ZIP files history desde AdminPack.
2. Aplica filtros opcionales: rango de fechas y estado de proceso.
3. Haz clic en "Search" para obtener los resultados.
4. Consulta la tabla con los jobs generados, su estado y detalles.
5. Descarga los archivos ZIP disponibles mediante el botón correspondiente.
6. Haz clic en "View" para detalles específicos de cada job.
7. Utiliza la paginación para revisar todas las páginas de resultados.

> **Recomendación:** Limpia los filtros antes de realizar nuevas búsquedas para evitar resultados duplicados o confusos.

---

## Vistas principales
- **Filtros:** Panel para selección de fecha y estado de procesamiento.
- **Tabla de resultados:** Muestra los jobs con información de Job #, Procesado, ZIP file y fecha de creación.
- **Paginación:** Permite navegar entre las páginas de resultados.
- **Acciones:** Descarga de ZIP y vista de detalles.

## Campos y validaciones
- **From / To:** Fechas válidas.
- **Process (Completed/Pending):** Selección clara de estado.
- Botón "Search" solo activa tras definir filtros mínimos.

---

## Casos de uso
- **Buscar jobs:** Filtra por fecha y estado, haz clic en Search.
- **Limpiar filtros:** Botón Clear para restablecer valores.
- **Descargar ZIP:** Descargar archivo asociado al job seleccionado.
- **Ver job:** Navegar a detalles del job mediante el botón View.

---

## Permisos necesarios
- **Ver jobs:** `zipjobs-view`
- **Descargar archivos ZIP:** `zipjobs-download`

Si no cuentas con estos permisos, solicita acceso a tu administrador.

---

## Errores comunes
- **Fechas inválidas:** Verifica el formato de las fechas.
- **Sin resultados:** Asegúrate de que existan jobs dentro del rango seleccionado.
- **Permisos insuficientes:** No podrás consultar ni descargar archivos.
- **Error de servidor:** Reintenta más tarde si la tabla no carga.

---

## Auditoría
El sistema registra automáticamente:
- Quién consultó cada job.
- Fecha y hora de la consulta y descarga.
- Job ID y estado del proceso.
Esto permite mantener un historial completo y seguro de todas las operaciones con archivos ZIP.
