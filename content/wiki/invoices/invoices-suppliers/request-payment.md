---
title: Supplier CFDI – Request Payments
summary: Gestión de solicitudes de pago para facturas de proveedores (CFDIs).
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-suppliers-cfdis
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, suppliers, cfdi, request-payment, catalogos]
---

# Objetivo
Permitir a los usuarios buscar CFDIs de proveedores, generar solicitudes de pago y gestionar anticipos asociados.

# Navegación de módulos
Se incluyen los siguientes accesos rápidos:

- **CFDI Invoices:** Lista de CFDIs de proveedores.
- **Request Payments:** Generación de solicitudes de pago.
- **Advance Payments:** Administración de anticipos.
- Iconos `mdi-circle-double` indican el módulo activo.

# Funcionalidades principales

1. **Búsqueda de facturas**
   - Filtros por proveedor, folios, fechas, tipo de comprobante y moneda.
   - Se pueden agregar múltiples folios manualmente.
   - Autocompletado para proveedores y selección de moneda.

2. **Selección de CFDIs**
   - Se pueden seleccionar todas o deseleccionar todas.
   - Se muestra estado de pago: pendiente, solicitado, pagado o cancelado.
   - Se calcula el total de CFDIs seleccionados considerando anticipos aplicables.

3. **Anticipos disponibles**
   - Se listan anticipos asociados al proveedor.
   - Solo se pueden usar los que coinciden con la moneda seleccionada.

4. **Generación de solicitud de pago**
   - Requiere seleccionar:
     - Al menos un CFDI.
     - Cuenta bancaria origen.
     - Cuenta bancaria del proveedor.
   - Permite agregar notas adicionales.
   - Se genera un registro de solicitud de pago y redirige a la vista detallada.

5. **Sincronización de CFDIs**
   - Para CFDIs no ligados a proveedores, se puede sincronizar manualmente.

# Componentes incluidos
Este módulo incorpora diversos elementos que permiten al usuario gestionar de forma sencilla las operaciones relacionadas con pagos y CFDIs. 
Cada componente cumple un rol específico en el flujo de trabajo:

   - Selección de proveedor
   El sistema cuenta con un buscador especializado que facilita la localización de proveedores registrados. 
   Esto permite al usuario elegir rápidamente la empresa o persona con la cual se realizará la operación, evitando errores en la captura manual.

   - Cuentas bancarias
   Se incluyen controles para seleccionar tanto la cuenta de origen como la cuenta de destino.

      - Cuenta bancaria origen: corresponde a la cuenta institucional desde la cual se realizará el pago.

      - Cuenta bancaria destino: se refiere a la cuenta asociada al proveedor, donde se recibirá el depósito.
      Esta estructura garantiza la trazabilidad de los movimientos y asegura que la información financiera sea consistente.

   - Listado de CFDIs
   Los comprobantes fiscales digitales (CFDIs) relacionados con los pagos se muestran en un listado claro y ordenado. 
   La presentación incluye indicadores visuales que permiten identificar el estatus de cada documento, así como opciones de filtrado y paginación para navegar entre grandes volúmenes de registros.

   - Navegación y paginación
   Para optimizar la experiencia del usuario, el sistema implementa un esquema de paginación que evita la sobrecarga visual cuando existen demasiados CFDIs vinculados. 
   Esto permite consultar la información en bloques manejables y mejorar el rendimiento en pantalla.

   - Acciones sobre los registros
   Se proporcionan botones que permiten realizar operaciones inmediatas sobre cada CFDI o registro listado, tales como:

      - Visualización detallada del documento.

      - Edición de la información asociada.

      - Eliminación segura del registro.

      - Ejecución de acciones rápidas (por ejemplo, confirmar un pago).
      Estas acciones están diseñadas para agilizar la gestión y reducir los pasos necesarios en tareas frecuentes.

# Observaciones
- Los CFDIs cancelados se muestran con fondo rojo.
- Los CFDIs con receptor diferente a TM se resaltan con fondo amarillo.
- Validaciones de moneda al aplicar anticipos.
- Campos y filtros reactivamente actualizan la lista de CFDIs.

# Flujo resumido
1. Seleccionar proveedor y moneda.
2. Aplicar filtros o agregar folios.
3. Seleccionar CFDIs a pagar.
4. Seleccionar cuentas bancarias origen y destino.
5. Confirmar y generar solicitud de pago.

# Notas técnicas
Este módulo incorpora distintos aspectos técnicos que permiten su correcto funcionamiento y aseguran la interacción fluida entre la interfaz y la lógica de negocio. 
A continuación se detallan los puntos clave:

   - Control de navegación interna
   El sistema utiliza propiedades calculadas para determinar qué sección o submódulo se encuentra activo en cada momento. 
   Esto facilita la transición entre apartados y mantiene la coherencia visual en la navegación, evitando que el usuario pierda el contexto de trabajo.

   - Gestión del estado
   Para el manejo de filtros, formularios y datos temporales se emplea un esquema de estado reactivo. 
   Esta estrategia permite que los cambios realizados por el usuario se reflejen de inmediato en la interfaz sin necesidad de recargar la vista, mejorando la experiencia de uso y reduciendo tiempos de espera.

   - Procesos principales del módulo
   El flujo técnico contempla varias operaciones clave que guían la interacción del usuario:

      - Búsqueda de información: localiza registros de acuerdo con criterios definidos.

      - Gestión de CFDIs: incluye la adición de facturas al proceso de búsqueda, la selección individual o masiva de comprobantes y el seguimiento de los mismos.

      - Generación de solicitudes de pago: automatiza el proceso de consolidación de facturas seleccionadas para crear una instrucción de pago.

      - Sincronización de datos: mantiene actualizada la información del proveedor y sus comprobantes fiscales en el sistema.

   - Integración con servicios externos
   El módulo se conecta con servicios de la API orientados a la administración de proveedores. 
   A través de estas integraciones se realizan tareas como búsquedas en tiempo real, sincronización de información y generación de pagos, lo que asegura que los datos gestionados en la plataforma estén alineados con las fuentes oficiales.

# Seguridad y permisos
- Accesible solo para roles: Administrador, Finanzas, Operaciones.
- Confirmaciones y alertas para operaciones críticas.

