---
title: Freight Forwarder Agents – Debit / Credit Notes
summary: Módulo para la administración de notas de débito y crédito de agentes freight forwarder, relacionadas con pagos, SOA y reportes.
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-11
module: payments-agents-debit-credit
roles: [Administrador, Finanzas, Operaciones]
tags: [pagos, agentes, debit, credit, notas, freight-forwarder]
---

# Objetivo
Gestionar las notas de débito y crédito emitidas por y hacia agentes freight forwarder, vinculadas con pagos, conciliaciones y reportes.

# Alcance
Incluye la creación, consulta y relación de notas de débito/crédito con módulos de **SOA**, **Pagos** y **Reportes**.

# Prerrequisitos
- Permisos:  
  - `payments.agents.debitCredit.manage`  
  - `payments.agents.soa.view`  
- Catálogos relacionados: **Agentes Freight Forwarder**, **Monedas**, **Métodos de Pago**

# Navegación
- Menú: `Payments → Agents → Debit / Credit Notes`
- Ruta: `/payments/agents/debit-credit`

# Flujo general
1. Registrar o vincular nota de débito/crédito.
2. Asociar con agente y SOA correspondiente.
3. Validar datos financieros y de moneda.
4. Guardar y reflejar en pagos y reportes.

> **Nota:** Toda nota debe estar ligada a un agente válido y conciliada con el módulo SOA.

## Vistas principales
- **Listado** de notas con filtros por agente, tipo (débito/crédito), fecha y estado.  
- **Formulario** de registro/edición con validaciones financieras.  
- **Detalle** con vínculos a pagos, SOA y reportes.  

## Campos y validaciones (resumen)
- **Agente** *(obligatorio)*  
- **Tipo de nota** (débito / crédito) *(obligatorio)*  
- **Monto** *(obligatorio, > 0, formato moneda válido)*  
- **Moneda** *(obligatorio, catálogo válido)*  
- **Referencia SOA** *(opcional, recomendada)*  

## Errores comunes
- Nota duplicada para el mismo agente y SOA.  
- Monto en formato inválido.  
- Moneda no registrada en catálogo.  
- Nota no vinculada a ningún agente.  
