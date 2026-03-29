---
description: How to extract and analyze Work Order (OT) line data
---

# Extracting and Analyzing OT Data

Follow these steps to extract detailed information for a specific Work Order (OT).

1. **Locate the extraction script**
   Ensure extract_ot_data.sql is present in the project root.

2. **Run the extraction via SQLcl**
   // turbo
   Connect to the database and run the script with the OT number:
   `ash
   @extract_ot_data.sql <NORDEN_TRABAJO>
   `

3. **Interpreting the Results**
   - **Código Capítulo**: The numerical ID of the chapter.
   - **Descripción Capítulo**: High-level grouping (e.g., "DETECCION").
   - **Subsistema**: Detailed subsystem (e.g., "EXTINTORES").
   - **Uds. Iniciales**: The quantity originally budgeted.
   - **Presupuestado**: Current quantity target.
   - **Instalado**: Total units across all "Partes de Montaje" in active state.

4. **Troubleshooting**
   - If decimals look wrong, ensure ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,' was executed (included in the script).
   - If "Instalado" reflects more than "Presupuestado", it indicates an over-installation or modification in reports.
