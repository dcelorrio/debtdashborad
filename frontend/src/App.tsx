import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { processRecord, ProcessedDebtRecord } from './utils/dataProcessor';
import { Sidebar } from './components/Sidebar';
import { TemporalDistChart, EntityPieChart, StatusComparisonChart, PaymentMethodPieChart } from './components/Charts';
import { DebtTable } from './components/Table';
import { 
  FileText, 
  RefreshCw, 
  Filter as FilterIcon,
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
  const { filters, isDarkMode: dark, toggleDarkMode, clearAll } = useDashboardStore();

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
        <span className="font-bold uppercase tracking-[0.8em] text-[13px] opacity-80 text-blue-500">SATYA REBOOT VC5.6 FINAL</span>
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
              <span className={`text-[12px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-slate-300' : 'text-slate-800'}`}>SATYA ANALYTICS • 2026/2027</span>
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
          
          <div className="col-span-2 row-span-2 flex flex-col gap-4">
            <div className={`w-full h-[240px] p-4 rounded-[2.5rem] border transition-all duration-500 shrink-0 ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
              <StatusComparisonChart data={data} filteredData={filteredData} />
            </div>
            <div className="flex-1">
               <SummaryStatusTable filteredData={filteredData} dark={dark} />
            </div>
          </div>

          <div className={`col-span-3 p-6 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <PaymentMethodPieChart data={data} filteredData={filteredData} />
          </div>
          <div className={`col-span-3 p-6 rounded-[2.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <EntityPieChart data={data} filteredData={filteredData} />
          </div>
        </div>

        <div className={`rounded-[2.5rem] border transition-all duration-500 mb-12 overflow-hidden mx-10 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="px-10 py-6 border-b flex justify-between items-center bg-opacity-10 backdrop-blur-md">
             <h3 className={`text-[12px] font-bold uppercase tracking-[0.5em] ${dark ? 'text-slate-500' : 'text-slate-500'}`}>DETALLE DE CARTERA ACTIVA</h3>
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest ${dark ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
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
      <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</span>
    </div>
    <span className={`text-[28px] font-extrabold tracking-tighter leading-none font-mono ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
      {isAmount ? `${(value / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M` : value.toLocaleString('es-ES')}
    </span>
  </div>
);

function SummaryStatusTable({ filteredData, dark }: { filteredData: ProcessedDebtRecord[], dark: boolean }) {
  const summary = useMemo(() => {
     const getEstado = (ent: string) => {
        if (!ent || ent === 'NULL' || ent === 'SIN ENTIDAD') return 'NO';
        if (ent === 'PAGADO') return 'PA';
        if (ent === 'PROGRESO') return 'PR';
        if (ent === 'INFORMADO') return 'IN';
        if (ent.includes('RET.SOLICITADA') || ent.includes('RET. SOLICITADA')) return 'RET';
        return 'SI';
     };

     const groups: Record<string, { empresa: string, estado: string, importe: number }> = {};
     
     filteredData.forEach(item => {
         const st = getEstado(item.entidad || '');
         const emp = (item.empresa && item.empresa !== 'SIN EMPRESA') ? item.empresa.split(' ')[0] : (item.cliente ? item.cliente.split(' ')[0] : 'DESCONOCIDA');
         const key = `${emp}_${st}`;
         if (!groups[key]) {
            groups[key] = { empresa: emp, estado: st, importe: 0 };
         }
         groups[key].importe += item.pendiente;
     });
     
     return Object.values(groups).sort((a,b) => b.importe - a.importe);
  }, [filteredData]);

  return (
      <div className={`w-full h-full rounded-[2.5rem] border flex flex-col overflow-hidden transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
         <div className="px-6 py-4 border-b border-opacity-50">
            <h3 className={`text-[12px] font-extrabold uppercase tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>RESUMEN ESTADOS</h3>
         </div>
         <div className="flex-1 overflow-y-auto scrollbar-hide p-2 bg-gradient-to-b from-transparent to-slate-500/5">
            <table className="w-full text-left">
               <thead className={`sticky top-0 backdrop-blur-md ${dark ? 'bg-slate-900/90 text-slate-500' : 'bg-white/90 text-slate-400'}`}>
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-tl-xl border-b border-transparent">EMPRESA</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-center border-b border-transparent">ESTADO</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-right rounded-tr-xl border-b border-transparent">IMPORTE</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${dark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                  {summary.map((row, i) => {
                     const isSi = row.estado === 'SI';
                     const badgeColor = isSi ? (dark ? 'bg-emerald-950 text-emerald-400 ring-emerald-900/50' : 'bg-emerald-50 text-emerald-600 ring-emerald-100') : (dark ? 'bg-slate-800 text-blue-400 ring-slate-700' : 'bg-blue-50 text-blue-600 ring-blue-100');
                     return (
                     <tr key={i} className={`group ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-all`}>
                        <td className={`px-4 py-3 text-[11px] font-semibold tracking-tight truncate max-w-[120px] ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{row.empresa}</td>
                        <td className="px-4 py-3 text-center">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm ring-1 ${badgeColor}`}>{row.estado}</span>
                        </td>
                        <td className={`px-4 py-3 text-[12px] font-extrabold text-right ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
                           {(row.importe / 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K
                        </td>
                     </tr>
                  )})}
               </tbody>
            </table>
         </div>
      </div>
  );
}
