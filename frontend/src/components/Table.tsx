import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { useDashboardStore } from '../store/useDashboardStore';

export const DebtTable = ({ data }: { data: ProcessedDebtRecord[] }) => {
  const dark = useDashboardStore(state => state.isDarkMode);

  // Helper function to format currency
  const formatCur = (val: number) => val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-hide">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className={`sticky top-0 z-10 ${dark ? 'bg-slate-900 border-slate-700 shadow-xl text-slate-400' : 'bg-white border-slate-200 shadow-sm text-slate-500'} border-b`}>
          <tr>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-center">ID</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">Cod</th>
            <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider">Cliente</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">Factura</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">F. Doc</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">F. Vto</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-right">Importe</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-right">Cobrado</th>
            <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-right text-blue-500">Pendiente</th>
            <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider">Forma Pago</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">Condición</th>
            <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider">Entidad</th>
            <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider">Contrato</th>
            <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider">Etiquetas / Alertas</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${dark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
          {data.map((item, idx) => (
            <tr key={idx} className={`group transition-all duration-150 ${dark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50/50'}`}>
              
              {/* ID Empresa */}
              <td className="px-2 py-1.5 text-center">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{item.idempresa}</span>
              </td>
              
              {/* Cod Cliente */}
              <td className={`px-2 py-1.5 text-[9px] font-mono ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.cod_cliente}
              </td>
              
              {/* Cliente */}
              <td className="px-3 py-1.5">
                <div 
                  className={`text-[10px] font-bold uppercase tracking-tight truncate max-w-[180px] ${dark ? 'text-slate-200' : 'text-slate-800'}`}
                  title={item.nombre_comercial ? `Comercial: ${item.nombre_comercial}` : undefined}
                >
                  {item.cliente}
                </div>
              </td>
              
              {/* N Factura */}
              <td className={`px-2 py-1.5 text-[10px] font-mono font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {item.nfactura}
              </td>
              
              {/* Fechas */}
              <td className={`px-2 py-1.5 text-[9px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.fdoc ? new Date(item.fdoc).toLocaleDateString('es-ES') : ''}
              </td>
              <td className={`px-2 py-1.5 text-[9px] font-semibold ${item.dias_vencidos > 0 ? 'text-red-500' : (dark ? 'text-slate-300' : 'text-slate-700')}`}>
                {item.vencimiento.toLocaleDateString('es-ES')}
                {item.dias_vencidos > 0 && <span className="ml-1 text-[8px] text-red-500">({item.dias_vencidos}d)</span>}
              </td>
              
              {/* Económicos */}
              <td className={`px-2 py-1.5 text-[10px] text-right xl:text-[11px] ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                {formatCur(item.importe)}
              </td>
              <td className={`px-2 py-1.5 text-[10px] text-right xl:text-[11px] ${dark ? 'text-green-500/80' : 'text-green-600'}`}>
                {formatCur(item.cobrado)}
              </td>
              <td className={`px-3 py-1.5 text-[11px] text-right font-bold xl:text-[12px] ${dark ? 'text-white' : 'text-slate-900'}`}>
                {formatCur(item.pendiente)}
              </td>
              
              {/* Datos Pago */}
              <td className={`px-3 py-1.5 text-[9px] font-semibold tracking-wider ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.forma_pago}
              </td>
              <td className={`px-2 py-1.5 text-[9px] truncate max-w-[100px] ${dark ? 'text-slate-400' : 'text-slate-500'}`} title={item.condicion_pago || ''}>
                {item.condicion_pago || '-'}
              </td>
              <td className={`px-3 py-1.5 text-[9px] font-bold ${dark ? 'text-teal-400' : 'text-teal-700'}`}>
                {item.entidad}
              </td>
              
              <td className={`px-2 py-1.5 text-[9px] truncate max-w-[100px] ${dark ? 'text-slate-400' : 'text-slate-500'}`} title={item.contrato || ''}>
                {item.contrato || '-'}
              </td>
              
              {/* Etiquetas y Alertas */}
              <td className="px-3 py-1.5">
                <div className="flex flex-wrap gap-1.5 items-center max-w-[250px] overflow-hidden">
                  {item.gestion && (
                    <span 
                      className={`cursor-help px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest border ${dark ? 'bg-orange-950/60 text-orange-400 border-orange-900/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}
                      title={item.comentario || 'Asunto en gestión (sin comentarios adjuntos)'}
                    >
                      • EN GESTIÓN
                    </span>
                  )}
                  {item.retencion && (
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest border ${dark ? 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                      • RETENCIÓN
                    </span>
                  )}
                  {item.tag_list.slice(0, 2).map((tag, i) => (
                    <span key={i} className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest border ${dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {tag}
                    </span>
                  ))}
                  {item.tag_list.length > 2 && (
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold border ${dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      +{item.tag_list.length - 2}
                    </span>
                  )}
                </div>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
