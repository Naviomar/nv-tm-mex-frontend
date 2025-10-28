---
title: Currencies – Introducción
summary: Catálogo de monedas utilizadas en operaciones, contratos y facturación.
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-currencies
roles: [Administrador, Finanzas]
tags: [configuracion, monedas, catalogos, finanzas, facturacion, permisos]
---

# Objetivo
Contar con un catálogo centralizado de monedas con su código ISO y símbolo, que sirva como referencia para seleccionar monedas en otros módulos del sistema. Este catálogo facilita la selección de monedas en formularios, contratos y registros de facturación, asegurando que la información esté actualizada y sea consistente en todo el sistema.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar monedas.  
- Valida que no existan códigos ISO duplicados y que los campos obligatorios estén completos.  
- El acceso a las funciones está controlado por permisos específicos.  
- Se registra quién crea, edita o elimina cada moneda para mayor seguridad y control.  

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.  
- Es recomendable tener un catálogo de países actualizado, ya que algunas monedas pueden estar asociadas a países específicos.  

# Navegación
- Menú principal: **Configuration → Currencies**  
- Ruta directa: `/configuration/currencies`  

# Flujo general de uso
1. Ingresa al módulo de Monedas desde el menú de configuración.  
2. Para agregar una moneda, haz clic en **"Nueva moneda"** y completa los campos requeridos.  
3. Antes de guardar, el sistema validará que no exista una moneda con el mismo código ISO.  
4. Puedes buscar monedas existentes usando los filtros por nombre o código ISO.  
5. Si necesitas editar o inhabilitar una moneda, selecciona la opción correspondiente en la lista.  
6. Las monedas inhabilitadas pueden reactivarse en cualquier momento.  

> **Recomendación:** Antes de crear una nueva moneda, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todas las monedas registradas, con opciones de filtro y búsqueda.  
- **Formulario:** Permite agregar o editar monedas, con validaciones en tiempo real.  
- **Detalle:** Visualiza información completa y relaciones de la moneda con contratos, cargos y facturación.  

## Campos y validaciones
- **Código ISO:** Obligatorio, único y de 3 caracteres.  
- **Nombre:** Obligatorio.  
- **Símbolo:** Opcional.  

---

## Casos de uso
- **Crear moneda:** Ingresa código ISO, nombre y símbolo. El sistema valida duplicados antes de guardar.  
- **Editar moneda:** Modifica los datos de una moneda existente con las mismas validaciones.  
- **Inhabilitar moneda:** Marca la moneda como inactiva, pero conserva su historial.  
- **Reactivar moneda:** Permite volver a habilitar una moneda previamente inhabilitada.  
- **Buscar moneda:** Utiliza los filtros para encontrar monedas por código ISO o nombre.  

---

## Permisos necesarios
Para realizar acciones en el módulo de Monedas, necesitas los siguientes permisos:  
- **Ver monedas:** `currencies-view`  
- **Crear moneda:** `currencies-create`  
- **Editar moneda:** `currencies-edit`  
- **Eliminar o restaurar moneda:** `currencies-delete`  

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.  

---

## Errores comunes
- **Código duplicado:** Ya existe una moneda con ese código ISO.  
- **Código vacío o inválido:** El código ISO debe tener 3 caracteres y no puede estar vacío.  
- **Nombre no ingresado:** Debes ingresar un nombre para la moneda.  
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.  
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.  

---

## Auditoría
El sistema registra automáticamente:  
- Quién creó, editó o inhabilitó cada moneda.  
- Fechas de creación, actualización e inhabilitación.  

Esto permite mantener un historial claro y seguro de todas las acciones realizadas en el catálogo de monedas.
