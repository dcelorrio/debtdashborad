import ReactECharts from 'echarts-for-react';
import { useDashboardStore, FilterKey } from '../store/useDashboardStore';
import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { useMemo } from 'react';
import { Zap } from 'lucide-react';

const formatK = (val: number) => {
    return (val / 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' K€';
};

const getMonthAbbr = (month: number) => {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[month - 1] || '';
};

// MASTER PRIMARY ORDER: BLUE, RED, YELLOW (AMARILLO)
const MASTER_PALETTE = ['#3b82f6', '#ef4444', '#facc15', '#8b5cf6', '#10b981', '#f97316', '#6366f1', '#ec4899', '#14b8a6'];

const useStableColors = (data: ProcessedDebtRecord[], dimension: (item: ProcessedDebtRecord) => string, palette: string[]) => {
  return useMemo(() => {
    // Calculamos el volumen total por cada valor para poder ordenar por importancia (mayor deuda primero)
    const totals: Record<string, number> = {};
    data.forEach(item => {
      const val = dimension(item);
      totals[val] = (totals[val] || 0) + item.pendiente;
    });

    // Ordenamos los valores de mayor a menor deuda acumulada
    const sortedValues = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const map: Record<string, string> = {};
    sortedValues.forEach((val, idx) => {
      map[val] = palette[idx % palette.length];
    });
    return map;
  }, [data, dimension, palette]);
};

export const TemporalDistChart = ({ filteredData, mode, setMode }: { filteredData: ProcessedDebtRecord[], mode: string, setMode: any }) => {
  const { isDarkMode: dark, toggleFilter, setFilter, filters, isSelectionMode, pendingFilters } = useDashboardStore();
  const currentFilters = isSelectionMode ? pendingFilters : filters;

  const { chartData, timeKeys } = useMemo(() => {
    const groups: Record<string, number> = {};
    const keysSet = new Set<string>();
    
    filteredData.forEach((item: ProcessedDebtRecord) => {
      let key = '';
      if (mode === 'MES') key = `${item.anyo}-${String(item.mes).padStart(2, '0')}`;
      else if (mode === 'TRIMESTRE') key = `${item.anyo}-Q${Math.ceil(item.mes/3)}`;
      else key = `${item.anyo}`;
      
      keysSet.add(key);
      groups[key] = (groups[key] || 0) + item.pendiente;
 group: "PROCRESSO"
    });

    const sortedKeys = Array.from(keysSet).sort();
    return { 
      chartData: groups, 
      timeKeys: sortedKeys 
    };
  }, [filteredData, mode]);

  const series = [{
    name: 'DEUDA TOTAL',
    type: 'bar',
    emphasis: { focus: 'series' },
    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
    data: timeKeys.map(key => {
      const parts = String(key).split('-');
      const anyo = parseInt(parts[0], 10);
      let isSelected = false;
      
      if (currentFilters.anyo.length === 0 && currentFilters.mes_label.length === 0) {
         isSelected = true;
      } else {
         if (mode === 'AÑO') {
            isSelected = currentFilters.anyo.includes(anyo);
         } else if (mode === 'MES' && parts[1]) {
            const mes = parseInt(parts[1], 10);
            const mesLabel = `${getMonthAbbr(mes)} ${String(anyo).slice(-2)}`;
            isSelected = currentFilters.mes_label.includes(mesLabel);
         } else if (mode === 'TRIMESTRE' && parts[1]) {
            const q = parseInt(parts[1].replace('Q', ''), 10);
            const months = [q * 3 - 2, q * 3 - 1, q * 3];
            const mesLabels = months.map(m => `${getMonthAbbr(m)} ${String(anyo).slice(-2)}`);
            isSelected = mesLabels.some(l => currentFilters.mes_label.includes(l));
         }
      }

      return {
        name: key,
        value: Math.round(chartData[key] || 0),
        itemStyle: { opacity: isSelected ? 1 : 0.3 }
      };
    })
  }];

  const handleBarClick = (params: any) => {
      const key = params.name || params.value; 
      if (!key) return;

      const parts = String(key).split('-');
      const anyoStr = parts[0];
      const anyo = parseInt(anyoStr, 10);
      
      const getFormattedLabel = (m: number, y: number) => `${getMonthAbbr(m)} ${String(y).slice(-2)}`;

      if (mode === 'AÑO') {
          if (isSelectionMode) {
              toggleFilter('anyo', anyo);
          } else {
              const isOnlyThis = currentFilters.anyo.length === 1 && currentFilters.anyo[0] === anyo;
              setFilter('anyo', isOnlyThis ? [] : [anyo]);
              setFilter('mes_label', []); 
          }
      } else if (mode === 'MES') {
          const mes = parseInt(parts[1], 10);
          const mesLabel = getFormattedLabel(mes, anyo);
          
          if (isSelectionMode) {
              toggleFilter('mes_label', mesLabel);
              if (currentFilters.anyo.length > 0) setFilter('anyo', []); 
          } else {
              const isOnlyThis = currentFilters.mes_label.length === 1 && currentFilters.mes_label[0] === mesLabel;
              setFilter('anyo', []);
              setFilter('mes_label', isOnlyThis ? [] : [mesLabel]);
          }
      } else if (mode === 'TRIMESTRE') {
          const q = parseInt(parts[1].replace('Q', ''), 10);
          const months = [q * 3 - 2, q * 3 - 1, q * 3];
          const mesLabels = months.map(m => getFormattedLabel(m, anyo));
          
          if (isSelectionMode) {
              mesLabels.forEach(l => toggleFilter('mes_label', l));
              if (currentFilters.anyo.length > 0) setFilter('anyo', []); 
          } else {
              const isOnlyThis = currentFilters.mes_label.length === 3 && mesLabels.every(l => currentFilters.mes_label.includes(l));
              setFilter('anyo', []);
              setFilter('mes_label', isOnlyThis ? [] : mesLabels);
          }
      }
  };

  const option = {
    backgroundColor: 'transparent',
    color: MASTER_PALETTE,
    tooltip: {
      trigger: 'axis',
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      textStyle: { color: dark ? '#cbd5e1' : '#1e3a8a', fontSize: 13, fontWeight: 'bold' },
      formatter: (params: any) => {
        let res = `<div style="padding:4px 8px; font-weight:bold; text-transform:uppercase; font-size:11px;">${params[0].axisValueLabel}</div>`;
        params.forEach((p: any) => {
          if (p.value > 0) res += `<div style="padding:2px 8px; display:flex; justify-content:space-between; gap:20px; font-size:12px; font-weight:bold;"><span style="color:${p.color}">● DEUDA GLOBAL</span><span style="color:${dark ? '#fff' : '#000'}">${formatK(p.value)}</span></div>`;
        });
        return res;
      }
    },
    grid: { top: 15, left: '2%', right: '2%', bottom: 45, containLabel: true },
    xAxis: {
      type: 'category',
      data: timeKeys,
      axisLabel: { 
        color: dark ? '#334155' : '#94a3b8', 
        fontSize: 10, 
        rotate: 45, 
        fontWeight: 'bold',
        formatter: (k: string) => {
          const parts = k.split('-');
          if (mode === 'MES' && parts[1]) return `${getMonthAbbr(parseInt(parts[1], 10))} ${parts[0].slice(-2)}`;
          if (mode === 'TRIMESTRE' && parts[1]) return `T${parts[1].slice(1)} ${parts[0].slice(-2)}`;
          return parts[0];
        }
      },
      axisLine: { lineStyle: { color: dark ? '#1e293b' : '#f1f5f9' } },
      triggerEvent: true
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: dark ? '#334155' : '#94a3b8', fontSize: 10, fontWeight: '600', formatter: (v: number) => `${Math.round(v/1000)}K` },
      splitLine: { lineStyle: { color: dark ? '#1e293b' : '#f1f5f9' } }
    },
    series
  };

  return (
    <div className="w-full h-full flex flex-col pt-2">
      <div className="flex justify-end items-center mb-1 px-4">
        <div className="flex bg-slate-100/10 p-1 rounded-xl gap-1 ring-1 ring-white/5">
          {['MES', 'TRIMESTRE', 'AÑO'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] transition-all ${
               mode === m ? 'bg-blue-600 text-white shadow-xl' : dark ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}>{m}</button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }} 
          onEvents={{ 
            'click': handleBarClick 
          }}
        />
      </div>
    </div>
  );
};

const SimpleIntersectionPie = ({ 
  fullData,
  filteredData, 
  dimension, 
  title, 
  filterKey, 
  customColors 
}: { 
  fullData: ProcessedDebtRecord[],
  filteredData: ProcessedDebtRecord[], 
  dimension: (item: ProcessedDebtRecord) => string, 
  title: string, 
  filterKey: FilterKey, 
  customColors?: Record<string, string> 
}) => {
  const { toggleFilter, isDarkMode: dark, isSelectionMode, pendingFilters, filters } = useDashboardStore();
  const stableColors = useStableColors(fullData, dimension, MASTER_PALETTE);
  
  const currentFilters = isSelectionMode ? pendingFilters : filters;
  const activeSelection = currentFilters[filterKey] || [];

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => { const val = dimension(item); counts[val] = (counts[val] || 0) + item.pendiente; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, dimension]);

  const option = {
    backgroundColor: 'transparent',
    color: MASTER_PALETTE,
    tooltip: {
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      textStyle: { color: dark ? '#cbd5e1' : '#1e3a8a', fontSize: 13, fontWeight: 'bold' },
      formatter: (p: any) => `<div style="padding:6px 10px; font-weight:bold; text-transform:uppercase;">● ${p.name}: ${formatK(p.value)}</div>`
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      left: '46%',
      top: '0%',
      selectedMode: true,
      textStyle: { color: dark ? '#64748b' : '#334155', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
      itemGap: 10,
      formatter: (name: string) => {
        const item = chartData.find(d => d.name === name);
        return `${name} | ${formatK(item?.value || 0)}`;
      }
    },
    series: [{
      type: 'pie',
      radius: filterKey === 'gestion' ? ['55%', '85%'] : ['35%', '65%'],
      center: ['22%', '50%'],
      itemStyle: { borderRadius: 10 },
      label: { show: false },
      emphasis: { scale: true, scaleSize: 10 },
      data: chartData.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: (customColors?.[d.name] || stableColors[d.name]),
            opacity: activeSelection.length === 0 || activeSelection.includes(d.name) ? 1 : 0.3
          }
      }))
    }]
  };

  if (chartData.length === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
           <span className="text-[10px] font-bold uppercase tracking-widest">{title} VACÍO</span>
        </div>
      );
  }

  return (
    <div className="w-full h-full relative flex flex-col pt-4">
       <h3 className={`absolute top-0 left-4 text-[20px] font-extrabold uppercase tracking-[0.15em] ${dark ? 'text-slate-200' : 'text-slate-800'} z-10`}>{title}</h3>
       <div className="flex-1 mt-4">
         <ReactECharts 
            option={option} 
            notMerge={true}
            style={{ height: '100%', width: '100%' }} 
            onEvents={{ 
              'click': (params: any) => toggleFilter(filterKey, params.name),
              'legendselectchanged': (params: any) => toggleFilter(filterKey, params.name)
            }} 
         />
       </div>
    </div>
  );
};

export const EntityPieChart = ({ data, filteredData }: any) => (
  <SimpleIntersectionPie 
    fullData={data} 
    filteredData={filteredData} 
    dimension={(i) => i.entidad} 
    title="ENTIDADES" 
    filterKey="entidad" 
  />
);

export const PaymentMethodPieChart = ({ data, filteredData }: any) => (
  <SimpleIntersectionPie 
    fullData={data} 
    filteredData={filteredData} 
    dimension={(i) => i.forma_pago} 
    title="COBROS" 
    filterKey="forma_pago" 
  />
);

export const StatusComparisonChart = ({ data, filteredData }: any) => (
  <SimpleIntersectionPie 
    fullData={data} 
    filteredData={filteredData} 
    dimension={(i) => (i.gestion ? 'SÍ' : 'NO')} 
    title="EN GESTIÓN" 
    filterKey="gestion" 
    customColors={{ 'SÍ': '#ef4444', 'NO': '#3b82f6' }}
  />
);

export const QuickFilters = ({ data }: { data: any[] }) => {
    const { filters, setFilter, isSelectionMode, pendingFilters } = useDashboardStore();
    const currentFilters = isSelectionMode ? pendingFilters : filters;
    
    const isVencidosActive = 
      currentFilters.abono.includes('NO') && 
      currentFilters.vencido.includes('SÍ') && 
      currentFilters.retencion.includes('NO') && 
      currentFilters.entidad.length > 0 && 
      !currentFilters.entidad.includes('PAGADO') && 
      !currentFilters.entidad.includes('PROGRESO') &&
      currentFilters.forma_pago.length > 0 && 
      !currentFilters.forma_pago.includes('RECIBO');
  
    const applyVencidos = () => {
      if (isVencidosActive) {
        setFilter('abono', []);
        setFilter('vencido', []);
        setFilter('retencion', []);
        setFilter('entidad', []);
        setFilter('forma_pago', []);
      } else {
        setFilter('abono', ['NO']);
        setFilter('vencido', ['SÍ']);
        setFilter('retencion', ['NO']);
        
        const allEntidades = Array.from(new Set(data.map(item => item.entidad)));
        const filteredEntidades = allEntidades.filter(e => e !== 'PAGADO' && e !== 'PROGRESO');
        setFilter('entidad', filteredEntidades);
        
        const allFormas = Array.from(new Set(data.map(item => item.forma_pago)));
        const filteredFormas = allFormas.filter(f => f !== 'RECIBO');
        setFilter('forma_pago', filteredFormas);
      }
    };
  
    return (
      <button 
        onClick={applyVencidos}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-[800] transition-all duration-300 shadow-lg relative overflow-hidden group 
          ${isVencidosActive ? 'scale-105 brightness-110 shadow-teal-500/30' : 'opacity-90 hover:opacity-100 hover:scale-105 active:scale-95'}`}
        style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          border: '1.5px solid rgba(255,255,255,0.2)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none mx-[7%] mt-[2%]" />
        
        <Zap className={`w-3.5 h-3.5 ${isVencidosActive ? 'fill-white animate-pulse' : ''}`} />
        <span className="relative z-10 text-[11px] tracking-tight uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
          Vencidos
        </span>
        
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    );
};
