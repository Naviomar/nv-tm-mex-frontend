---
title: Invoices TM – Carga de CFDI
summary: Proceso para asociar CFDI a facturas TM mediante archivo ZIP.
order: 1
status: stable
version: 1.2.0
updatedAt: 2025-10-07
module: invoices-tm
roles: [Administrador, Contabilidad, Finanzas]
tags: [facturas, TM, CFDI, XML, PDF, upload, finanzas, control]
---

# Objetivo
El módulo permite cargar los archivos CFDI correspondientes a facturas TM que inicialmente no cuentan con ellos. El objetivo es garantizar que todas las facturas tengan su XML y PDF correctamente asociados en el sistema, asegurando la trazabilidad, cumplimiento fiscal y control interno de los documentos.

# Alcance
- Permite exportar facturas TM sin CFDI para revisión.
- Proporciona un archivo ejemplo (ZIP) que sirve de guía para organizar los documentos.
- Permite subir un ZIP con los archivos XML y PDF y relacionarlos con la factura mediante un Excel de control.
- Controla la validez y estructura del archivo antes de su procesamiento.
- Facilita el seguimiento de las cargas y el estado de cada factura.

# Prerrequisitos
- Acceso al módulo de facturas TM con permisos de carga.
- Tener instaladas herramientas para manejar archivos ZIP.
- Contar con los XML y PDF de cada factura pendiente de asociar.

# Navegación
- Menú principal: **Admin Pack → Invoices TM → Upload CFDI**
- Ruta directa: `/adminpack/invoices-tm/upload-cfdi`

# Flujo general de uso
1. Exporta las facturas TM que no tienen CFDI.
2. Revisa los datos exportados y confirma que estén completos.
3. Descarga el archivo ZIP de ejemplo para conocer la estructura del Excel de control.
4. Coloca los XML y PDF de cada factura en el ZIP siguiendo la relación indicada en el Excel, donde cada factura se asocia con su UUID de CFDI.
5. Sube el archivo ZIP mediante el formulario del módulo.
6. El sistema valida los archivos, procesa la información y registra la carga para auditoría.
7. Una vez procesados, las facturas tendrán sus CFDI correctamente asociados y disponibles para consulta.

> **Recomendación:** Asegúrate de respetar la estructura del Excel y los nombres de archivos indicados en el ejemplo antes de subir el ZIP para evitar errores de procesamiento.

---

## Vistas principales
- **Listado de facturas sin CFDI:** Muestra todas las facturas TM que requieren ser actualizadas.
- **Descarga de ZIP de ejemplo:** Proporciona la estructura correcta para organizar los archivos XML y PDF.
- **Formulario de carga:** Permite seleccionar y subir un archivo ZIP con los documentos asociados a cada factura.
- **Detalle de carga:** Visualiza el resultado de la carga, indicando facturas procesadas, errores y documentos faltantes.

## Campos y validaciones
- **Archivo ZIP:** Obligatorio, debe contener todos los XML y PDF de las facturas junto con el Excel de control.
- **Excel de control:** Debe incluir la relación correcta entre factura ID y UUID de CFDI.
- **Formato de archivos:** XML y PDF deben estar completos y sin corrupción.
- **Tamaño del archivo:** Debe cumplir con las restricciones del sistema para cargas exitosas.

---

## Casos de uso
- **Exportar facturas sin CFDI:** Permite obtener un listado de facturas pendientes.
- **Descargar archivo de ejemplo:** Proporciona un ZIP de referencia con la estructura correcta.
- **Preparar ZIP de carga:** Combina los XML, PDF y el Excel de control siguiendo la guía del ejemplo.
- **Subir ZIP al sistema:** El módulo valida, procesa y asocia los CFDI a las facturas.
- **Visualizar resultados:** Revisa cuáles facturas fueron procesadas correctamente y cuáles presentan errores.
- **Auditoría de cargas:** Consulta histórico de cargas realizadas por usuario, fecha y estado.

---

## Permisos necesarios
- **Ver facturas TM:** `invoices-tm-view`
- **Exportar facturas:** `invoices-tm-export`
- **Cargar CFDI:** `invoices-tm-upload`
- **Consultar histórico de cargas:** `invoices-tm-history`

> Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.

---

## Errores comunes
- ZIP incompleto o sin archivos necesarios.
- XML o PDF faltantes o corruptos.
- Excel de control mal formado o con relaciones incorrectas.
- Intento de carga sin permisos suficientes.
- Error de servidor al procesar el archivo ZIP.

---

## Auditoría
El sistema registra automáticamente:
- Usuario que realizó la carga.
- Fecha y hora de la carga.
- Número de facturas procesadas correctamente y errores.
- Histórico de cargas previas para trazabilidad y control interno.
