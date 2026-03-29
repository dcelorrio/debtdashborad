# 📊 Debt Dashboard (SATYA REBOOT)

¡Bienvenido al **Debt Dashboard (Proyecto SATYA)**! Este es un cuadro de mando financiero avanzado, construido para analizar métricas de deuda activa y facturas pendientes desde una base de datos Oracle con herramientas modernas, alto rendimiento y una interfaz interactiva densa enfocada a BI (Business Intelligence).

## 🚀 Arquitectura del Proyecto

El proyecto está diseñado de forma modular (Microservicios) basándose en las siguientes tecnologías:

- **Frontend (UI / UX):** 
  - **Librería Core:** React 18 + TypeScript + Vite.
  - **Estilizado:** Tailwind CSS + Lucide React (Iconos).
  - **State Management:** Zustand (Motor de Filtros de Intersección Estricta).
  - **Visualización:** Apache ECharts para gráficos ultrarrápidos, reactivos, y libres de dependencias de renderizado pesadas.
- **Backend (API):**
  - **Framework:** FastAPI + Python 3.
  - **Conectores:** `oracledb` nativo para conectividad remota a servidores Oracle, manejando conexiones por SSID o Service Names.
  - **Procesamiento de Datos:** Pandas.

## ✨ Funcionalidades Destacadas (VC5.6 Final)

1. **Motor de Filtros por Intersección Estricta:** 
   El sistema no aplica "difuminado" ni "sombras" a los parámetros que se ignoran. Filtra activamente todo el dataset global. Si en el gráfico de cobros haces clic en `TARJETA`, los gráficos de _Facturas en Gestión_, el Eje _Temporal_, y la _Lista de Datatable_ desecharán todo lo que no esté estrictamente pagado por tarjeta.
2. **Sistema Evolutivo de Colores:** 
   El color designa de mayor a menor volumen total. El elemento que acumula más deuda se llevará el color Rojo/Azul principal, sin importar cuántos flujos alternes, manteniendo siempre un diseño BI coherente y legible.
3. **Responsive Sticky Bar (UI Densa):** 
   Pensado para ordenadores. Cuanto haces scroll por la tabla inferior de cartera, un "Topbar de Cristal de KPIs" pegajoso (_sticky_) con las cifras principales te acompaña para no perder nunca la visibilidad de los impactos financieros de tu lectura.
4. **Drill-down Temporal:** 
   Convierte el Gráfico de Barras temporal en un cuadro de mando para inyectar filtros temporales haciendo clic directamente sobre el mes/trimestre/año graficado.

## 🛠️ Despliegue

La solución está dockerizada por completo e implementa contenedores independientes y redes puente configurables.

### 1. Requisitos
- Docker y Docker Compose instalados.
- Base de datos Oracle en marcha referenciada.
- Generar un archivo `conexiones.json` válido donde figuren las credenciales bajo la clave `"SATYA_PRO"`.

### 2. Levantar el Cuadro de Mando

Sitúate en la raíz del repositorio y ejecuta:

```bash
docker compose build --no-cache
docker compose up --force-recreate -d
```

### 3. Verificando Inicios 
Una vez desplegado:
- Accede al Panel Frontend principal: **[http://localhost:3008](http://localhost:3008)**
- Accede a la API de Documentación auto-generada (Swagger UI): **[http://localhost:8001/docs](http://localhost:8001/docs)**

---
_Nota: Al emplear arquitecturas reactivas en base de datos grandes, asegúrate de mantener saneado los puertos temporales de Docker y desactivar caché del navegador al forzar recargas en frontends (Ctrl + Shift + R)._
