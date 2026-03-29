import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { useDashboardStore } from '../store/useDashboardStore';

export const DebtTable = ({ data }: { data: ProcessedDebtRecord[] }) => {
  const dark = useDashboardStore(state => state.isDarkMode);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className={`${dark ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'} border-b`}>
          <tr>
            <th className={`px-10 py-6 text-[13px] font-[1000] uppercase tracking-[0.4em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Cliente / Razon Social</th>
            <th className={`px-10 py-6 text-[13px] font-[1000] uppercase tracking-[0.4em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Factura / Vencimiento</th>
            <th className={`px-10 py-6 text-[13px] font-[1000] uppercase tracking-[0.4em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Días Vencidos</th>
            <th className={`px-10 py-6 text-[13px] font-[1000] uppercase tracking-[0.4em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Forma de Pago</th>
            <th className={`px-10 py-6 text-[13px] font-[1000] uppercase tracking-[0.4em] text-right ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Importe Pendiente</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${dark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
          {data.map((item, idx) => (
            <tr key={idx} className={`group transition-all duration-300 ${dark ? 'hover:bg-slate-800/20' : 'hover:bg-blue-50/20'}`}>
              <td className="px-10 py-8">
                <div className={`text-[16px] font-[1000] uppercase tracking-tight transition-colors ${dark ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-700'}`}>{item.cliente}</div>
                <div className="flex gap-3 mt-3">
                  {item.gestion && <span className={`${dark ? 'bg-orange-950/30 text-orange-400 border-orange-900/50' : 'bg-orange-50 text-orange-600 border-orange-100'} px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg shadow-orange-500/5`}>EN GESTIÓN</span>}
                  {item.retencion && <span className={`${dark ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg shadow-indigo-500/5`}>RETENCIÓN</span>}
                </div>
              </td>
              <td className="px-10 py-8 whitespace-nowrap">
                <div className={`font-[1000] text-[15px] tracking-widest ${dark ? 'text-slate-400' : 'text-slate-600'}`}>#{item.nfactura}</div>
                <div className={`font-black text-[12px] uppercase mt-2 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{item.vencimiento.toLocaleDateString('es-ES')}</div>
              </td>
              <td className="px-10 py-8">
                <div className={`text-[15px] font-[1000] uppercase tracking-widest ${item.dias_vencidos > 0 ? (dark ? 'text-red-400' : 'text-red-500') : (dark ? 'text-slate-700' : 'text-slate-300')}`}>
                  {item.dias_vencidos > 0 ? `${item.dias_vencidos} DÍAS` : '---'}
                </div>
              </td>
              <td className="px-10 py-8">
                <span className={`font-black text-[11px] uppercase tracking-[0.3em] px-5 py-2 rounded-2xl ${dark ? 'bg-slate-900 text-slate-400 border border-slate-700 shadow-inner' : 'bg-slate-100 text-slate-500 shadow-sm'}`}>{item.forma_pago}</span>
              </td>
              <td className="px-10 py-8 text-right underline-offset-8 decoration-blue-500/30">
                <div className={`text-[20px] font-[1000] tracking-tighter ${dark ? 'text-white' : 'text-slate-950'}`}>
                  {item.pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
