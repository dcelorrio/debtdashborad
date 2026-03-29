import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore, FilterKey } from './store/useDashboardStore';
import { processRecord, ProcessedDebtRecord } from './utils/dataProcessor';
import { Sidebar } from './components/Sidebar';
import { TemporalDistChart, EntityPieChart, StatusComparisonChart, PaymentMethodPieChart } from './components/Charts';
import { DebtTable } from './components/Table';
import { 
  FileText, 
  RefreshCw, 
  Filter as FilterIcon,
  X,
  Moon,
  Sun,
  Coins,
  History,
  Activity
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ProcessedDebtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [temporalMode, setTemporalMode] = useState<'MES' | 'TRIMESTRE' | 'AÑO'>('MES');
  const { filters, isDarkMode: dark, toggleFilter, toggleDarkMode, clearAll } = useDashboardStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/debt-report');
        if (!response.ok) throw new Error('Error al cargar datos');
        const rawData = await response.json();
        const processed = rawData.map(processRecord);
        setData(processed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredData = (excludeKey?: string) => {
    return data.filter(item => {
      for (const [key, selected] of Object.entries(filters)) {
        if (key === (excludeKey as string)) continue;
        if (selected.length === 0) continue;
        
        if (key === 'empresa' && !selected.includes(item.empresa)) return false;
        if (key === 'anyo' && !selected.includes(item.anyo)) return false;
        if (key === 'mes' && !selected.includes(item.mes)) return false;
        if (key === 'entidad' && !selected.includes(item.entidad)) return false;
        if (key === 'forma_pago' && !selected.includes(item.forma_pago)) return false;
        if (key === 'gestion' && !selected.includes(item.gestion ? 'SÍ' : 'NO')) return false;
        if (key === 'retencion' && !selected.includes(item.retencion ? 'SÍ' : 'NO')) return false;
        if (key === 'mes_doc' && (item.mes_doc === null || !selected.includes(item.mes_doc))) return false;
        if (key === 'cliente' && !selected.includes(item.cliente)) return false;
        if (key === 'vencido' && !selected.includes(item.vencido ? 'SÍ' : 'NO')) return false;
        if (key === 'etiquetas' && !item.tag_list.some(t => selected.includes(t as string))) return false;
        if (key === 'contrato' && !(item.contrato && item.contrato.split(',').some(c => selected.includes(c.trim().toUpperCase())))) return false;
      }
      return true;
    });
  };

  const filteredData = useMemo(() => {
    const res = getFilteredData();
    console.log('VC4.6 FILTER SYNC:', { activeFilters: filters, resultCount: res.length });
    return res;
  }, [data, filters]);
  
  const totalDebt = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.pendiente, 0), [filteredData]);
  const debtOverdue = useMemo(() => filteredData.filter(i => i.vencido).reduce((acc, curr) => acc + curr.pendiente, 0), [filteredData]);
  const linkedInvoices = useMemo(() => filteredData.length, [filteredData]);
  const totalClients = useMemo(() => new Set(filteredData.map(i => i.cliente)).size, [filteredData]);

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex flex-col items-center">
        <Activity className="animate-pulse text-blue-500 mb-4" size={56} />
        <span className="font-black uppercase tracking-[0.8em] text-[13px] opacity-80 text-blue-500">SATYA REBOOT VC5.6 FINAL</span>
      </div>
    </div>
  );

  return (
    <div className={`flex w-screen h-screen overflow-hidden ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar data={data} />
       <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        <div className={`sticky top-0 z-50 flex justify-between items-end px-10 py-2 border-b backdrop-blur-xl shadow-lg ${dark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
          <div className="flex gap-8 items-end">
            <KPICard title="DEUDA" value={totalDebt} isAmount dark={dark} icon={<Coins className="text-blue-500" size={16} />} />
            <KPICard title="VENCIDA" value={debtOverdue} isAmount dark={dark} icon={<History className="text-red-500" size={16} />} />
            <KPICard title="FACTURAS" value={linkedInvoices} dark={dark} icon={<FileText className="text-indigo-400" size={16} />} />
            <KPICard title="CLIENTES" value={totalClients} dark={dark} icon={<FilterIcon className="text-emerald-500" size={16} />} />
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${dark ? 'bg-slate-900 border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className={`text-[12px] font-[1000] uppercase tracking-[0.3em] ${dark ? 'text-slate-300' : 'text-slate-800'}`}>SATYA ANALYTICS • 2026/2027</span>
            </div>
            <button onClick={() => toggleDarkMode()} className={`p-2.5 rounded-xl border transition-all ${dark ? 'bg-slate-900 border-slate-700 text-yellow-500 shadow-xl' : 'bg-white border-slate-200 text-slate-400 shadow-md hover:shadow-xl'}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={clearAll} className={`p-2.5 rounded-xl border transition-all ${dark ? 'bg-red-950/30 border-red-900 text-red-500' : 'bg-red-50 border-red-200 text-red-600'} hover:bg-red-600 hover:text-white shadow-md hover:shadow-xl`}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-4 mb-4 mt-6 px-10">
          <div className={`col-span-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200 shadow-2xl'} h-[480px]`}>
            <TemporalDistChart 
              filteredData={filteredData} 
              mode={temporalMode} 
              setMode={setTemporalMode} 
            />
          </div>
          
          <div className="col-span-2 flex flex-col gap-4">
            <div className={`w-full h-[240px] p-4 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
              <StatusComparisonChart data={data} filteredData={filteredData} />
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide py-1">
                {Object.values(filters).some(v => v.length > 0) && (
                   <>
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-center ${dark ? 'text-slate-600' : 'text-slate-300'}`}>FILTROS ACTIVOS</p>
                    {(Object.entries(filters) as [FilterKey, (string|number)[]][]).map(([key, values]) => (
                      values.length > 0 && <SelectionBadge key={key} label={`${key}: ${values.join(',')}`} dark={dark} onClear={() => values.forEach(v => toggleFilter(key, v))} />
                    ))}
                   </>
                )}
            </div>
          </div>

          <div className={`col-span-3 p-6 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <PaymentMethodPieChart data={data} filteredData={filteredData} />
          </div>
          <div className={`col-span-3 p-6 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <EntityPieChart data={data} filteredData={filteredData} />
          </div>
          <div className="col-span-2 flex flex-col justify-center items-center">
             <div className={`w-full h-full rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center opacity-40 ${dark ? 'border-slate-800 text-slate-800' : 'border-slate-200 text-slate-200'}`}>
                <Activity size={32} className="mb-3" />
                <span className="text-[10px] font-black uppercase tracking-[0.8em]">CONCATENATION VC4.4</span>
             </div>
          </div>
        </div>

        <div className={`rounded-[2.5rem] border transition-all duration-500 mb-12 overflow-hidden mx-10 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="px-10 py-6 border-b flex justify-between items-center bg-opacity-10 backdrop-blur-md">
             <h3 className={`text-[12px] font-black uppercase tracking-[0.5em] ${dark ? 'text-slate-500' : 'text-slate-500'}`}>DETALLE DE CARTERA ACTIVA</h3>
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${dark ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
               EXPLORER MODE
             </span>
          </div>
          <DebtTable data={filteredData} />
        </div>
      </main>
    </div>
  );
}

const KPICard = ({ title, value, dark, isAmount, icon }: any) => (
  <div className={`flex flex-col border-l-2 pl-3 py-0 transition-all ${dark ? 'border-slate-800' : 'border-slate-300'}`}>
    <div className="flex items-center gap-2 mb-0.5 opacity-60">
      {icon}
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</span>
    </div>
    <span className={`text-[28px] font-[1000] tracking-tighter leading-none font-mono ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
      {isAmount ? `${(value / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M` : value.toLocaleString('es-ES')}
    </span>
  </div>
);

function SelectionBadge({ label, onClear, dark }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-[10.5px] font-black uppercase tracking-widest transition-all ${
      dark ? 'bg-blue-950/20 border-white/5 text-blue-400 shadow-xl' : 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm'
    }`}>
      <span className="truncate max-w-[150px]">{label.replace('ANYO', 'EJERCICIO').replace('MES_DOC', 'MES DOC')}</span>
      <button onClick={onClear} className="hover:text-red-500 transition-colors p-1"><X size={12} /></button>
    </div>
  );
}
