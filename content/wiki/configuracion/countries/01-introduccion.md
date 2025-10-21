---
title: Countries – Introducción
summary: Catálogo de países para operaciones y datos generales.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-countries
roles: [Administrador, Operaciones]
tags: [configuracion, catalogos, geografia, countries, permisos]
---

# Objetivo
Mantener un catálogo centralizado de países con sus códigos ISO y moneda principal, que sirva como referencia en otros módulos del sistema. Este catálogo asegura uniformidad en la captura de información geográfica y financiera, reduciendo errores en registros de clientes, proveedores y operaciones.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar países.  
- Valida que no existan países duplicados y que los campos obligatorios estén completos.  
- El acceso a las funciones está controlado por permisos específicos.  
- Se registra quién crea, edita o elimina cada país para mayor seguridad y control.  

# Prerrequisitos
- Contar con permisos de acceso al sistema.  
- Tener disponible el catálogo de monedas, ya que cada país puede estar asociado a una moneda principal.  

# Navegación
- Menú principal: **Configuration → Countries**  
- Ruta directa: `/configuration/countries`  

# Flujo general de uso
1. Ingresa al módulo de Países desde el menú de configuración.  
2. Para agregar un país, haz clic en **"Nuevo país"** y completa los campos requeridos.  
3. Antes de guardar, el sistema validará que no exista un país con el mismo nombre o código ISO.  
4. Puedes buscar países existentes usando filtros por nombre, código ISO o moneda.  
5. Si necesitas editar o inhabilitar un país, selecciona la opción correspondiente en la lista.  
6. Los países inhabilitados pueden reactivarse en cualquier momento.  

> **Recomendación:** Antes de crear un nuevo país, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los países registrados, con opciones de filtro y búsqueda.  
- **Formulario:** Permite agregar o editar países, con validaciones en tiempo real.  
- **Detalle:** Visualiza información completa y relaciones del país con clientes, proveedores y aeropuertos.  

## Campos y validaciones
- **Nombre:** Obligatorio y único.  
- **Código ISO 2:** Obligatorio, exactamente 2 caracteres.  
- **Código ISO 3:** Obligatorio, exactamente 3 caracteres.  
- **Moneda principal:** Opcional, seleccionada desde el catálogo de monedas.  
- **Estatus:** Activo/Inactivo.  

---

## Casos de uso
- **Crear país:** Ingresa nombre, códigos ISO y moneda. El sistema valida duplicados antes de guardar.  
- **Editar país:** Modifica los datos de un país existente con las mismas validaciones.  
- **Inhabilitar país:** Marca el país como inactivo, pero conserva su historial.  
- **Reactivar país:** Permite volver a habilitar un país previamente inhabilitado.  
- **Buscar país:** Utiliza filtros para encontrar países por nombre, código ISO o moneda.  

---

## Permisos necesarios
Para realizar acciones en el módulo de Países, necesitas los siguientes permisos:  
- **Ver países:** `countries-view`  
- **Crear país:** `countries-create`  
- **Editar país:** `countries-edit`  
- **Eliminar o restaurar país:** `countries-delete`  

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.  

---

## Errores comunes
- **Nombre duplicado:** Ya existe un país con este nombre.  
- **Código ISO inválido:** Debe cumplir con la longitud requerida (2 o 3 caracteres).  
- **Moneda no seleccionada o inexistente:** La moneda debe pertenecer al catálogo activo.  
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.  
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.  

---

## Auditoría
El sistema registra automáticamente:  
- Quién creó, editó o inhabilitó cada país.  
- Fechas de creación, actualización e inhabilitación.  

Esto permite mantener un historial claro y seguro de todas las acciones realizadas en el catálogo de países.  
