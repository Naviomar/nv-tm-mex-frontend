---
title: Dashboard de operaciones
summary: Pantalla de control para importaciones, exportaciones y métricas clave del módulo marítimo.
roles: [Operaciones, Logística, Administrador]
tags: [maritimo, importacion, exportacion, dashboard, indicadores]
order: 3
status: draft
version: 1.0.0
updatedAt: 2025-09-23
module: maritime
permalink: /manual/maritime-dashboard
---

# Objetivo y alcance
Brindar a los usuarios de operaciones y logística una vista consolidada de las métricas clave relacionadas con importaciones, exportaciones y estatus de contenedores en transporte marítimo.  
Incluye acceso a indicadores como arribos pendientes, revalidaciones, bookings y demurrages.  

---

# Dashboard de Operaciones Marítimas
Resumen general

El Dashboard Marítimo es una pantalla de control diseñada para que el equipo de operaciones, logística y administración tenga una visión clara y actualizada de todo lo que ocurre con las importaciones, exportaciones y contenedores marítimos.
Permite consultar indicadores clave (KPIs), detectar retrasos y revisar métricas como arribos pendientes, revalidaciones, bookings confirmados o demurrages.

El Dashboard Marítimo mostrado en la imagen es la pantalla principal de monitoreo operativo para las actividades de importación y exportación marítima.
Está diseñado con una interfaz clara y dividida en secciones, para que los usuarios puedan consultar rápidamente el estado de cada proceso logístico.

En la parte superior, se muestra el nombre de la compañía (TM México), seguido de las pestañas de navegación principales del sistema:

- Maritime (Marítimo)

- Air (Aéreo)

- Billing (Facturación)

Esto indica que el sistema es modular y permite cambiar fácilmente entre operaciones marítimas, aéreas o administrativas.

---

# Encabezado principal

**Título:**

Maritime Dashboard
Es el nombre de la vista actual. Indica que estás en el panel de control correspondiente al módulo marítimo.

**Filtros superiores**

Bajo el título, aparecen los filtros principales del sistema:

- From (Desde): Fecha inicial del rango de búsqueda (por ejemplo, 09/01/2025).

- To (Hasta): Fecha final (por ejemplo, 10/31/2025).

- Search customers (Buscar clientes): Campo de búsqueda para filtrar los resultados por cliente específico.

- CLEAR: Botón para limpiar los filtros.

- APPLY: Botón azul que aplica los filtros seleccionados y actualiza los datos del panel.

Debajo de estos campos se muestra la leyenda:

Filters applied: Date range 2025-08-31 – 2025-10-30

Esto confirma que los filtros han sido aplicados y muestra el rango de fechas activo en ese momento.

---

# Indicadores del dashboard (KPI cards)

La zona central contiene 8 tarjetas principales (indicadores clave) organizadas en dos filas.
Cada tarjeta muestra el nombre del indicador, un número representativo (en este caso “0”) y una breve descripción del tipo de información que agrupa.

A continuación, se describe cada uno:

**1. Total Import**

- Valor mostrado: 0 referencias.

- Significado: Cantidad total de referencias o embarques de importación registrados en el rango de fechas seleccionado.

- Icono: Barco (símbolo de carga marítima).

**2. Total Export**

- Valor mostrado: 0 referencias.

- Significado: Número total de exportaciones realizadas en el periodo.

- Icono: Barco similar al anterior, pero orientado a exportación.

**3. Unique Customers**

- Valor mostrado: 0 clientes.

- Significado: Muestra el número de clientes únicos que tuvieron operaciones marítimas (import o export).

- Texto adicional: “View list” permite abrir la lista detallada de clientes.

- Icono: Tres figuras humanas, representando la cartera de clientes.

**4. Pending Arrival Notice**

- Valor mostrado: 0 referencias.

- Significado: Cantidad de avisos de arribo pendientes por procesar.

- Etiqueta inferior: “Maritime Import” indica que se trata solo de operaciones de importación.

- Icono: Campana roja (alerta o notificación pendiente).

**5. Pending Revalidation**

- Valor mostrado: 0 referencias.
 
- Significado: Muestra cuántas revalidaciones de contenedores siguen pendientes.

- Etiqueta: “Maritime Import”.

- Icono: Carpeta con lápiz (representa documentos por validar).

**6. Import Containers**

- Valor mostrado: 0 contenedores.

- Significado: Total de contenedores asociados a operaciones de importación.

- Icono: Contenedor gris (símbolo físico de carga).

**7. Export Containers** 

- Valor mostrado: 0 contenedores.

- Significado: Total de contenedores en operaciones de exportación.

- Icono: Contenedor gris igual al de importación, pero en otra sección.

**8. Booking Confirmation** 

- Valor mostrado: 0 export references.

- Significado: Muestra las confirmaciones de espacio (bookings) realizadas con navieras.

- Icono: Boleto o ticket (símbolo de confirmación o reserva).

**9. Import Demurrages**

- Valor mostrado: 0 contenedores.

- Significado: Indica el número de contenedores con cargos por demurrage (uso prolongado del contenedor).

- Nota: Muestra “Containers (amount > 0)” para dejar claro que solo aparecen los casos con monto pendiente.

- Icono: Cronómetro gris (tiempo de permanencia en puerto).

---

# Interpretación de los resultados

Si todos los valores están en 0, significa que no hay operaciones registradas dentro del rango de fechas seleccionado o que aún no se han actualizado los datos en el sistema.

Los indicadores cambiarán automáticamente al presionar “Apply” con nuevas fechas o al buscar un cliente específico.

---

# Comportamiento del dashboard

- Cada tarjeta puede incluir un enlace interno (por ejemplo, “View list” o “Maritime Import”) que dirige a una sección más detallada del sistema.

- El fondo oscuro con texto y acentos azules está diseñado para mejorar la legibilidad y el contraste visual.

- Los íconos cambian de color según su estado o tipo de dato (por ejemplo, campana roja = aviso pendiente, carpeta amarilla = documentación).

- Los botones “Clear” y “Apply” están resaltados para guiar al usuario en la actualización de datos.

---

# Buenas prácticas de uso

- Antes de aplicar filtros, asegúrate de definir correctamente el rango de fechas.

- Si el sistema muestra “0” en todos los indicadores, verifica si hay registros recientes o amplía el rango de fechas.

- Utiliza el buscador de clientes para enfocar los indicadores en un cliente o naviera específica.

- Aplica los filtros y espera unos segundos a que los datos se actualicen (puede depender de la conexión con las APIs externas).

- Usa “Clear” para reiniciar la vista y mostrar el total global.

---

1. Objetivo del dashboard

El objetivo es ofrecer una vista consolidada de la información más importante de las operaciones marítimas, ayudando a los usuarios a:

- Ver el estado general de las importaciones y exportaciones.

- Monitorear cuántos contenedores están pendientes de arribo o revalidación.

- Analizar la cantidad de clientes únicos atendidos.

- Identificar contenedores en situación de demurrage (es decir, con cargos por uso prolongado).

- Consultar confirmaciones de bookings (reservas con las navieras).

En pocas palabras, es una herramienta de seguimiento y análisis operativo para tener el control total de las operaciones marítimas.

---

2. Requisitos previos

Para acceder correctamente al dashboard, se necesitan algunos permisos y configuraciones previas:

**Permisos del sistema**

- Ver dashboard marítimo: Permite acceder y visualizar la información principal.

- Consultar referencias marítimas: Permite abrir detalles de las operaciones o contenedores.

**Datos necesarios**

- El catálogo de clientes debe estar actualizado.

- El catálogo de navieras (empresas marítimas) también debe estar disponible.

**Integraciones**

El sistema puede conectarse con:

- Plataformas de bookings de navieras (para ver confirmaciones de espacio).

- APIs de tracking de contenedores (para rastrear su ubicación en tiempo real).

---

3. Navegación dentro de la aplicación

- Ruta de acceso en el menú: Inicio → Maritime

- URL: /maritime/dashboard

**Secciones principales del dashboard**

1. Total Import / Export — Volumen total de importaciones y exportaciones.

2. Unique Customers — Número de clientes distintos atendidos.

3. Pending Arrival Notice — Arribos pendientes de notificación.

4. Pending Revalidation — Contenedores que aún necesitan ser revalidados.

5. Booking Confirmation — Reservas confirmadas por las navieras.

6. Import/Export Containers — Estado general de los contenedores.

7. Import Demurrages — Contenedores con cargos por retraso.

---

4. Conceptos importantes

- Arrival Notice (Aviso de arribo): Documento que indica cuándo llega un buque y qué carga transporta.

- Revalidación: Trámite para autorizar la salida o liberación de un contenedor.

- Booking Confirmation (Confirmación de reserva): Aprobación de espacio en el buque por parte de la naviera.

- Demurrage: Cobro adicional cuando un contenedor permanece más tiempo del permitido en puerto.

---

5. Flujo de uso (de principio a fin)

1. El usuario ingresa al Dashboard Marítimo.

2. Selecciona el rango de fechas que desea analizar y, si quiere, un cliente específico.

3. El sistema actualiza automáticamente los indicadores y gráficos en pantalla.

4. El usuario puede hacer clic en un indicador para ver los detalles (por ejemplo, todos los contenedores con demurrage).

5. Finalmente, el usuario puede exportar o generar reportes con la información visible.

**Consejo:**

Para obtener resultados más rápidos, se recomienda aplicar filtros con rangos de fecha cortos (por ejemplo, el último mes).

---

6. Pantalla principal del Dashboard

**Propósito**

Reunir todos los indicadores clave (KPIs) de las operaciones marítimas en un solo lugar.

**Filtros disponibles**

- Desde (From): Fecha inicial del rango que se desea analizar.

- Hasta (To): Fecha final del rango.

- Buscar cliente (Search customers): Permite filtrar la información de un cliente específico (opcional).

**Acciones del usuario**

- Apply (Aplicar) → Actualiza los datos según los filtros seleccionados.

- Clear (Limpiar) → Quita los filtros y muestra todos los datos generales.

**Mensajes del sistema**

**Éxito:** “Filtros aplicados correctamente.”

**Error:** “No se encontraron resultados para los criterios seleccionados.”

---

7. Cómo consultar los indicadores marítimos

**Antes de comenzar**

Asegúrate de tener el permiso de visualización del dashboard (maritime-view).

**Pasos**

1. Selecciona un rango de fechas y, si lo deseas, el nombre del cliente.

2. Pulsa “Apply” para ver los resultados.

3. Revisa los indicadores actualizados en pantalla.

**Resultado esperado**

El sistema mostrará los valores más recientes de cada KPI según los filtros aplicados.
Además, los últimos filtros utilizados quedarán guardados automáticamente para la próxima sesión.

---

8. Reglas de funcionamiento

- Si no hay información disponible para un indicador, se mostrará como “0”.

- Los cálculos siempre se realizan dentro del rango de fechas seleccionado.

- Un cliente que tenga múltiples operaciones se contará solo una vez como cliente único.

---

9. Integraciones con otros sistemas

El dashboard se conecta automáticamente con distintos módulos para mantener los datos actualizados:

- Navieras → Para obtener información de bookings y estatus de arribo.

- Sistema de clientes → Para identificar y contar clientes únicos.

- Módulo de contenedores → Para validar demurrages, movimientos y ubicación.

---

# Air Dashboard – Panel de control de operaciones aéreas

El módulo Air Dashboard forma parte del sistema de monitoreo y control logístico de TM México, diseñado para centralizar la información de las operaciones aéreas, tanto de importación como de exportación. 
Este panel permite al usuario analizar datos de clientes, referencias, volúmenes de carga (CBM), y estados pendientes, ofreciendo una visión general del desempeño operativo en un rango de fechas determinado.

---

# Sección: Descripción general

El Air Dashboard es un tablero interactivo que proporciona métricas clave relacionadas con las operaciones aéreas. Su diseño está orientado a la consulta rápida y filtrada de información, permitiendo visualizar de forma inmediata los totales de importación, exportación, clientes únicos, y resúmenes volumétricos.

El panel se divide en tres áreas principales:

1. Barra superior de navegación

2. Panel de filtros

3. Tarjetas de métricas y resúmenes

---

1. Barra superior de navegación

Ubicada en la parte superior del módulo, permite moverse entre los diferentes tableros principales del sistema:

- MARITIME: Muestra el dashboard de operaciones marítimas.

- AIR: Sección activa correspondiente al panel aéreo.

- BILLING: Acceso directo al módulo de facturación y cobros.

La pestaña AIR aparece resaltada para indicar que el usuario se encuentra en el dashboard aéreo.

---

2. Panel de filtros

En la parte superior del dashboard, el usuario puede filtrar la información mediante distintos parámetros:

- Rango de fechas (From / To): Permite definir el periodo de análisis.

  - Ejemplo mostrado: Del 01/09/2025 al 31/10/2025.

- Campo de búsqueda de clientes: Barra de búsqueda para localizar información asociada a clientes específicos.

- Botones de acción:

  - CLEAR: Limpia los filtros aplicados y restablece la vista general.

  - APPLY: Ejecuta los filtros seleccionados y actualiza los resultados.

**Indicador de filtros aplicados:**
Debajo de los campos de búsqueda se muestra la leyenda “Filters applied: Date range …” con el rango de fechas exacto del análisis, por ejemplo:

Filters applied: Date range 2025-08-31 – 2025-10-30.

---

3. Tarjetas de métricas y resúmenes

El panel principal presenta tarjetas con los indicadores más relevantes para el área aérea. Cada tarjeta muestra los totales de referencias, clientes y volumen (CBM), agrupados en secciones operativas:

**Total Import**

- Muestra la cantidad total de referencias de importación aérea.

- Incluye ícono representativo de un avión.

- Indicador mostrado: 0 referencias (sin datos disponibles).

**Total Export** 

- Presenta el número total de referencias de exportación aérea.

- Ícono de avión orientado hacia el lado derecho.

- Indicador mostrado: 0 referencias.

**Unique Customers**

- Cantidad de clientes únicos que tuvieron actividad en el periodo filtrado.

- Ícono de grupo de usuarios.

- Indicador mostrado: 0 clientes.

- Enlace auxiliar: VIEW LIST, para consultar el listado detallado.

**Pending Notification**

- Registra las referencias pendientes de notificación en procesos de importación aérea.

- Ícono de campana de alerta.

- Indicador mostrado: 0 referencias.

**Pending Release**

- Muestra el número de referencias pendientes de liberación en importación aérea.

- Ícono de documento con firma.

- Indicador mostrado: 0 referencias.

**Import CBM Summary** 

- Resumen de volumen total de carga importada (CBM).

- Campos mostrados:

  - Total CBM: 0.00

  - Total M3: 0.00

  - Total Packages: 0

- Ícono de cubo tridimensional (paquete).

**Export CBM Summary**

- Resumen de volumen total de carga exportada (CBM).

- Campos mostrados:

  - Total CBM: 0.00

  - Total M3: 0.00

  - Total Packages: 0

- Ícono de cubo tridimensional.

---

4. Observaciones generales

- El panel opera bajo un modo oscuro (dark mode) para mejorar la legibilidad y enfoque visual.

- Los valores se actualizan dinámicamente según los filtros aplicados.

- Si no existen registros para el rango de fechas seleccionado, todos los indicadores se muestran en cero.

- Este módulo se integra con el backend de operaciones aéreas, de donde obtiene los datos procesados en tiempo real.

---

5. Funcionalidad esperada

- Visualizar métricas operativas en un rango de fechas determinado.

- Filtrar información por cliente o por periodo.

- Consultar volúmenes de carga importada/exportada.

- Identificar clientes activos y referencias pendientes.

- Acceder al detalle de registros desde las secciones VIEW LIST o equivalentes.

---

6. Estado actual

- Versión: 1.0.0

- Estatus: Estable

- Última actualización: 31/10/2025

- Desarrollado por: TM México – Equipo de sistemas y análisis de datos logísticos

---

# Billing Dashboard – Panel de Facturación

El módulo **Billing Dashboard** proporciona una vista general consolidada de la información de facturación del sistema. 
Está diseñado para ofrecer indicadores rápidos sobre el volumen de facturas, clientes únicos y la distribución de documentos por tipo de transporte y servicio. 
Su propósito es facilitar el análisis de desempeño financiero, identificar tendencias y validar la consistencia de la información registrada en los distintos módulos operativos.

Este panel permite aplicar filtros por rango de fechas y clientes específicos, mostrando de forma centralizada los totales y desglose de facturas generadas.

---

# Filtros de Búsqueda
En la parte superior del panel se encuentran los **controles de filtrado**, compuestos por:
- **From / To:** Campos de selección de fecha que permiten establecer el rango de análisis (por ejemplo, *09/01/2025 – 10/31/2025*).  
- **Search customers:** Barra de búsqueda que permite localizar facturación asociada a un cliente específico.  
- **Buttons:**  
  - **Apply:** Aplica los filtros seleccionados.  
  - **Clear:** Restablece los valores a su estado inicial.

Al aplicar los filtros, el sistema muestra en la sección inferior un texto de referencia con el **rango de fechas efectivo** (por ejemplo: *Date range: 2025-08-31 – 2025-10-30*).

---

# Sección: Customer Invoices
En esta área se resumen las métricas generales relacionadas con las facturas emitidas a clientes.

| Indicador | Descripción |
|------------|-------------|
| **Total Invoices** | Total general de facturas emitidas en el periodo. |
| **TM Invoices** | Total de facturas asociadas al transporte terrestre (*Truck Management*). |
| **WM Invoices** | Total de facturas asociadas al módulo de almacén o gestión marítima (*Warehouse/Maritime Management*). |
| **Unique Customers** | Número de clientes únicos que recibieron facturas en el rango seleccionado. Incluye acceso directo al listado mediante el enlace **“View List”**. |

Cada uno de estos bloques muestra un valor numérico destacado (en azul), representando la cantidad total en la métrica correspondiente.

---

# Sección: TM Invoices by Service
Corresponde al desglose de facturas generadas bajo el módulo **Truck Management (TM)**, clasificadas según el tipo de servicio:

| Servicio            | Descripción                                                              |
|---------------------|--------------------------------------------------------------------------|
| **Maritime Import** | Facturas por servicios de importación marítima bajo gestión terrestre.   |
| **Maritime Export** | Facturas de exportación marítima procesadas en TM.                       |
| **Air Import**      | Facturas de importación aérea generadas en TM.                           |
| **Air Export**      | Facturas de exportación aérea asociadas al módulo TM.                    |

Cada tarjeta muestra el número de facturas generadas (**# Invoices**) para cada tipo de servicio.

---

# Sección: WM Invoices by Service
Esta sección refleja las mismas categorías anteriores, pero para el módulo **Warehouse/Maritime (WM)**, representando facturación procesada a nivel de operaciones marítimas o de almacén:

| Servicio | Descripción                                                           |
|---------------------------|------------------------------------------------------|
| **Maritime Import**       | Facturación por operaciones de importación marítima. |
| **Maritime Export**       | Facturación por exportaciones marítimas.             |
| **Air Import**            | Facturas de importación aérea gestionadas desde WM.  |
| **Air Export**            | Facturas de exportación aérea emitidas desde WM.     |

Las métricas son equivalentes a las del bloque de TM, mostrando los totales por tipo de servicio.

---

# Totales por Servicio y Moneda
En la parte inferior del panel (no visible completamente en la imagen) se encuentra la sección **“Totals by Service and Currency”**, destinada a consolidar el total de facturación según el tipo de servicio y la moneda utilizada en la transacción (USD, MXN, EUR, etc.).  
Esta información complementa los bloques superiores, permitiendo una visión financiera global y comparativa.

---

# Funcionalidades Adicionales
- **Visualización dinámica:** Las tarjetas se actualizan automáticamente tras aplicar filtros, sin necesidad de recargar la página.  
- **Interfaz oscura (Dark Mode):** Diseño optimizado para uso prolongado en entornos operativos, mejorando la legibilidad de los datos.  
- **Indicadores visuales:** El uso de números en color azul refuerza el enfoque en los valores cuantitativos.  
- **Accesos rápidos:** Posibilidad de acceder al detalle de clientes desde la tarjeta *Unique Customers*.  

---

# Uso y Propósito
El **Billing Dashboard** es una herramienta clave para los equipos de **Finanzas, Auditoría y Administración**, ya que proporciona métricas consolidadas de los distintos módulos operativos (TM y WM). Su principal utilidad radica en:
- Monitorear la actividad de facturación en periodos determinados.  
- Detectar posibles anomalías o periodos sin movimiento.  
- Comparar desempeño entre tipos de transporte (marítimo, aéreo, terrestre).  
- Facilitar la conciliación entre datos operativos y financieros.  

---

# Seguridad y Permisos
El acceso al **Billing Dashboard** está restringido a los roles:
- **Administrador:** Acceso total al módulo, incluyendo filtros y detalles por cliente.  
- **Finanzas:** Visualización completa de métricas e indicadores financieros.  
- **Auditoría:** Acceso de solo lectura para revisión de datos históricos y validación contable.

---

# Estado Actual
El panel mostrado refleja un escenario sin datos (todas las métricas en **0**), lo que puede corresponder a:
- Un rango de fechas sin registros.  
- Falta de integración con los módulos de facturación.  
- Periodo de prueba o entorno de staging.  

---

# Próximas Mejoras (Sugeridas)
- Implementar gráficos de tendencia mensual (facturas por mes).  
- Incorporar filtros por país o sucursal.  
- Agregar indicadores de monto total facturado y promedio por cliente.  
- Integración con reportes descargables en formato **PDF** o **Excel**.

---
