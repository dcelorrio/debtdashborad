---
name: oracle_ot_analysis
description: Skill for analyzing and extracting Work Order (OT) data from the SATYA Oracle schema.
---

# Oracle OT Analysis Skill

This skill provides the knowledge and patterns required to analyze Work Orders (Ordenes de Trabajo) in the SATYA schema.

## Core Schema Patterns

### Key Tables
- **SATYA.ORDEN_TRABAJO**: Header table.
  - IDEST_ORDEN_TRABAJO = 1: Status "Pendiente".
  - NORDEN_TRABAJO: User-facing OT primary number.
- **SATYA.LORDEN_TRABAJO**: Line item table (Budgeted items).
  - UNIDADES: Current budgeted units.
  - UNIDADES_ORIG: Original/Initial budgeted units.
  - COSTO, PRECIO: Line item financial data.
  - IDORDEN_TRABAJO_CAPITULO: Links to chapters.
  - IDSUBSIS: Links to subsystems.
- **SATYA.LPARTE_MONTAJE**: Installation report lines (Installed items).
  - UNIDADES: Quantity installed in a specific report.
  - Linked to LORDEN_TRABAJO via IDLORDEN_TRABAJO.
  - ESTADO = 1: Only count items in state 1 for final "Installed" quantity.
- **SATYA.ORDEN_TRABAJO_CAPITULO**: Chapter metadata.
- **SATYA.SUBSIS**: Subsystem metadata.
- **SATYA.EST_LORDEN_TRABAJO**: Line status descriptions.

### Logic for "Installed" Units
The total installed units for a line must be calculated by summing all related installation report lines:
`sql
SELECT SUM(m.unidades) 
FROM SATYA.lparte_montaje m 
WHERE m.idlorden_trabajo = :id_linea 
AND m.estado = 1
`

## Common Procedures
- Always set NLS_NUMERIC_CHARACTERS = '.,' before querying to ensure correct decimal parsing in scripts.
- Join LORDEN_TRABAJO with ORDEN_TRABAJO_CAPITULO for categorization.
