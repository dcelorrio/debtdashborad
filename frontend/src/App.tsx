import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { processRecord, ProcessedDebtRecord } from './utils/dataProcessor';
import { Sidebar } from './components/Sidebar';
import { TemporalDistChart, EntityPieChart, StatusComparisonChart, PaymentMethodPieChart } from './components/Charts';
import { DebtTable } from './components/Table';
import { GlobalSearch } from './components/GlobalSearch';
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
        if (key === 'nfactura' && !selected.includes(item.nfactura)) return false;
        if (key === 'cod_cliente' && !selected.includes(item.cod_cliente)) return false;
        if (key === 'mes_label' && !selected.includes(item.mes_label)) return false;
        if (key === 'mes_doc_label' && (item.mes_doc_label === null || !selected.includes(item.mes_doc_label))) return false;
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
        <div className={`sticky top-0 z-50 flex justify-between items-end pl-4 pr-10 py-2 border-b backdrop-blur-xl shadow-lg ${dark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
          <div className="flex gap-8 items-end">
            <KPICard title="DEUDA" value={totalDebt} isAmount dark={dark} icon={<Coins className="text-blue-500" size={16} />} />
            <KPICard title="VENCIDA" value={debtOverdue} isAmount dark={dark} icon={<History className="text-red-500" size={16} />} />
            <KPICard title="FACTURAS" value={linkedInvoices} dark={dark} icon={<FileText className="text-indigo-400" size={16} />} />
            <KPICard title="CLIENTES" value={totalClients} dark={dark} icon={<FilterIcon className="text-emerald-500" size={16} />} />
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch data={data} dark={dark} />
            <button onClick={() => toggleDarkMode()} className={`p-2.5 rounded-xl border transition-all ${dark ? 'bg-slate-900 border-slate-700 text-yellow-500 shadow-xl' : 'bg-white border-slate-200 text-slate-400 shadow-md hover:shadow-xl'}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={clearAll} className={`p-2.5 rounded-xl border transition-all ${dark ? 'bg-red-950/30 border-red-900 text-red-500' : 'bg-red-50 border-red-200 text-red-600'} hover:bg-red-600 hover:text-white shadow-md hover:shadow-xl`}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-4 mb-4 mt-6 pl-4 pr-10">
          <div className={`col-span-6 p-6 rounded-[1.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200 shadow-2xl'} h-[480px]`}>
            <TemporalDistChart 
              filteredData={filteredData} 
              mode={temporalMode} 
              setMode={setTemporalMode} 
            />
          </div>
          
          <div className="col-span-2 row-span-2 flex flex-col gap-4 h-[796px]">
            <div className={`w-full h-[240px] p-4 rounded-[1.5rem] border transition-all duration-500 shrink-0 ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
              <StatusComparisonChart data={data} filteredData={filteredData} />
            </div>
            <div className="flex-1 min-h-0">
               <SummaryStatusTable filteredData={filteredData} dark={dark} />
            </div>
          </div>

          <div className={`col-span-2 p-6 rounded-[1.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <PaymentMethodPieChart data={data} filteredData={filteredData} />
          </div>
          <div className={`col-span-2 p-6 rounded-[1.5rem] border transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} h-[300px]`}>
             <EntityPieChart data={data} filteredData={filteredData} />
          </div>
          {/* Empty Placeholder Card */}
          <div className={`col-span-2 rounded-[1.5rem] border border-dashed transition-all duration-500 flex items-center justify-center p-6 bg-transparent h-[300px] ${dark ? 'border-slate-800/30 text-slate-700' : 'border-slate-300 text-slate-300'}`}>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-50">Espacio Reservado</span>
          </div>
        </div>

        <div className={`rounded-[1.5rem] border transition-all duration-500 mb-12 overflow-hidden ml-4 mr-10 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
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
  const { toggleFilter, setFilter, filters } = useDashboardStore();

  const summary = useMemo(() => {
     const getEstado = (ent: string) => {
        if (!ent || ent === 'NULL' || ent === 'SIN ENTIDAD') return 'NO';
        if (ent === 'PAGADO') return 'PA';
        if (ent === 'PROGRESO') return 'PR';
        if (ent === 'INFORMADO') return 'IN';
        if (ent.includes('RET.SOLICITADA') || ent.includes('RET. SOLICITADA')) return 'RET';
        return 'SI';
     };

     const groups: Record<string, { empresa: string, cliente: string, estado: string, importe: number, rawEntidades: Set<string> }> = {};
     
     filteredData.forEach(item => {
         const rawEnt = item.entidad || 'SIN ENTIDAD';
         const st = getEstado(rawEnt);
         const emp = item.empresa;
         const cli = item.cliente || 'DESCONOCIDO';
         const key = `${emp}_${cli}_${st}`;
         if (!groups[key]) {
            groups[key] = { empresa: emp, cliente: cli, estado: st, importe: 0, rawEntidades: new Set() };
         }
         groups[key].importe += item.pendiente;
         groups[key].rawEntidades.add(rawEnt);
     });
     
     return Object.values(groups).sort((a,b) => {
         if (a.estado !== b.estado) {
             const order: Record<string, number> = { 'NO': 1, 'IN': 2, 'SI': 3, 'PA': 4, 'PR': 5, 'RET': 6 };
             const valA = order[a.estado] || 99;
             const valB = order[b.estado] || 99;
             if (valA !== valB) return valA - valB;
             return a.estado.localeCompare(b.estado);
         }
         return b.importe - a.importe;
     });
  }, [filteredData]);

  return (
      <div className={`w-full h-full rounded-none border flex flex-col overflow-hidden transition-all duration-500 ${dark ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
         <div className="flex-1 overflow-y-auto scrollbar-hide p-1 bg-gradient-to-b from-transparent to-slate-500/5">
            <table className="w-full text-left">
               <thead className={`sticky top-0 backdrop-blur-md z-10 ${dark ? 'bg-slate-900/90 text-slate-500' : 'bg-white/90 text-slate-400'}`}>
                  <tr>
                    <th className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-b border-transparent">EMPRESA</th>
                    <th className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-b border-transparent">CLIENTE</th>
                    <th className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-center border-b border-transparent">ESTADO</th>
                    <th className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-right border-b border-transparent">IMPORTE</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${dark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                  {summary.map((row, i) => {
                     const isSi = row.estado === 'SI';
                     const badgeColor = isSi ? (dark ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200') : (dark ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-blue-50 text-blue-600 border-blue-200');
                     
                     const isEmpresaFiltered = filters.empresa.includes(row.empresa);
                     const isClienteFiltered = filters.cliente.includes(row.cliente);
                     const isEstadoFiltered = Array.from(row.rawEntidades).some(ent => filters.entidad.includes(ent));
                     
                     return (
                     <tr key={i} className={`group ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-all`}>
                        <td 
                           onClick={() => toggleFilter('empresa', row.empresa)}
                           title={row.empresa}
                           className={`px-2 py-0.5 text-[10px] font-bold tracking-tight truncate max-w-[60px] cursor-pointer hover:underline ${isEmpresaFiltered ? (dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100/50 text-blue-700') : (dark ? 'text-slate-400' : 'text-slate-500')}`} 
                        >{row.empresa}</td>
                        <td 
                           onClick={() => toggleFilter('cliente', row.cliente)}
                           title={row.cliente}
                           className={`px-2 py-0.5 text-[11px] font-semibold tracking-tight truncate max-w-[120px] cursor-pointer hover:underline ${isClienteFiltered ? (dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100/50 text-blue-700') : (dark ? 'text-slate-200' : 'text-slate-700')}`} 
                        >{row.cliente}</td>
                        <td className="px-2 py-0.5 text-center cursor-pointer" onClick={() => setFilter('entidad', Array.from(row.rawEntidades))}>
                           <span className={`px-1.5 py-0 rounded text-[9px] font-extrabold shadow-sm border hover:border-blue-400 transition-all ${isEstadoFiltered ? 'ring-2 ring-blue-500 ring-offset-1 ' + (dark ? 'ring-offset-slate-900' : 'ring-offset-white') : ''} ${badgeColor}`}>{row.estado}</span>
                        </td>
                        <td className={`px-2 py-0.5 text-[11px] font-extrabold text-right ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
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
