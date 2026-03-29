import { useState, useMemo } from 'react';
import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { useDashboardStore } from '../store/useDashboardStore';
import { ChevronUp, ChevronDown } from 'lucide-react';

type SortKey = 'empresa' | 'cod_cliente' | 'cliente' | 'nfactura' | 'fdoc' | 'vencimiento' | 'importe' | 'cobrado' | 'pendiente' | 'forma_pago' | 'condicion_pago' | 'entidad' | 'contrato';
type SortDir = 'asc' | 'desc';

import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export const DebtTable = ({ data }: { data: ProcessedDebtRecord[] }) => {
  const { isDarkMode: dark, toggleFilter } = useDashboardStore();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let aVal: any = a[sortKey as keyof ProcessedDebtRecord];
      let bVal: any = b[sortKey as keyof ProcessedDebtRecord];
      
      // Handle dates
      if (sortKey === 'vencimiento') { aVal = a.vencimiento.getTime(); bVal = b.vencimiento.getTime(); }
      if (sortKey === 'fdoc') { aVal = a.fdoc ? new Date(a.fdoc).getTime() : 0; bVal = b.fdoc ? new Date(b.fdoc).getTime() : 0; }
      
      // Handle nulls
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      // Compare
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal), 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData.map(item => ({
      Empresa: item.empresa,
      "Cód. Cliente": item.cod_cliente,
      Cliente: item.cliente,
      "Factura(s)": item.nfactura,
      "F. Doc": item.fdoc ? new Date(item.fdoc).toLocaleDateString('es-ES') : '',
      "F. Vto": item.vencimiento.toLocaleDateString('es-ES'),
      Importe: item.importe,
      Cobrado: item.cobrado,
      Pendiente: item.pendiente,
      "Forma Pago": item.forma_pago,
      "Condición Pago": item.condicion_pago,
      Entidad: item.entidad,
      Contrato: item.contrato,
      Comentario: item.comentario,
      Etiquetas: item.tag_list.join(', ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cartera Activa");
    XLSX.writeFile(wb, "Detalle_Cartera_Activa.xlsx");
  };

  const formatCur = (val: number) => val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  // Sortable header component
  const SortTh = ({ label, colKey, className = '' }: { label: string; colKey: SortKey; className?: string }) => {
    const active = sortKey === colKey;
    return (
      <th 
        className={`px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer select-none group ${className}`}
        onClick={() => handleSort(colKey)}
      >
        <div className="flex items-center gap-0.5 relative">
          <span>{label}</span>
          <div className="flex flex-col -space-y-1 ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronUp size={8} className={active && sortDir === 'asc' ? 'text-blue-400 opacity-100' : ''} />
            <ChevronDown size={8} className={active && sortDir === 'desc' ? 'text-blue-400 opacity-100' : ''} />
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="relative overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-hide">
      <button 
        onClick={exportToExcel}
        className={`absolute top-1.5 right-4 z-20 p-1.5 rounded-lg border transition-all ${dark ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 shadow-lg' : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm'}`}
        title="Exportar a Excel"
      >
        <Download size={14} />
      </button>
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className={`sticky top-0 z-10 ${dark ? 'bg-slate-900 border-slate-700 shadow-xl text-slate-400' : 'bg-white border-slate-200 shadow-sm text-slate-500'} border-b`}>
          <tr>
            <SortTh label="Empresa" colKey="empresa" className="px-3 text-center" />
            <SortTh label="Cod" colKey="cod_cliente" />
            <SortTh label="Cliente" colKey="cliente" className="px-3" />
            <SortTh label="Factura" colKey="nfactura" />
            <SortTh label="F. Doc" colKey="fdoc" />
            <SortTh label="F. Vto" colKey="vencimiento" />
            <SortTh label="Importe" colKey="importe" className="text-right" />
            <SortTh label="Cobrado" colKey="cobrado" className="text-right" />
            <SortTh label="Pendiente" colKey="pendiente" className="text-right text-blue-500" />
            <SortTh label="Forma Pago" colKey="forma_pago" className="px-3" />
            <SortTh label="Condición" colKey="condicion_pago" />
            <SortTh label="Entidad" colKey="entidad" className="px-3" />
            <SortTh label="Contrato" colKey="contrato" />
            <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">Etiquetas / Alertas</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${dark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
          {sortedData.map((item, idx) => (
            <tr key={idx} className={`group transition-all duration-100 ${dark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50/50'}`}>
              
              {/* Empresa */}
              <td 
                className={`px-3 py-0.5 text-center cursor-pointer hover:font-black transition-all ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => toggleFilter('empresa', item.empresa)}
              >
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-widest ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>{item.empresa}</span>
              </td>
              
              {/* Cod Cliente */}
              <td 
                className={`px-2 py-0.5 text-[9px] font-mono cursor-pointer hover:font-bold ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => toggleFilter('cod_cliente', item.cod_cliente)}
              >
                {item.cod_cliente}
              </td>
              
              {/* Cliente */}
              <td className="px-3 py-0.5">
                <div 
                  className={`text-[9px] font-bold uppercase tracking-tight truncate max-w-[170px] cursor-pointer hover:text-blue-500 transition-colors ${dark ? 'text-slate-200' : 'text-slate-800'}`}
                  title={item.nombre_comercial ? `Comercial: ${item.nombre_comercial}` : item.cliente}
                  onClick={() => toggleFilter('cliente', item.cliente)}
                >
                  {item.cliente}
                </div>
              </td>
              
              {/* N Factura */}
              <td className={`px-2 py-0.5 text-[9px] font-mono font-semibold cursor-pointer ${dark ? 'text-indigo-400 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-800'}`}>
                {item.nfactura ? item.nfactura.split(',').map((fac, i) => (
                  <div key={i} onClick={() => toggleFilter('nfactura', fac.trim())}>{fac.trim()}</div>
                )) : '-'}
              </td>
              
              {/* Fechas */}
              <td className={`px-2 py-0.5 text-[9px] cursor-pointer hover:underline ${dark ? 'text-slate-400' : 'text-slate-500'}`} onClick={() => { if(item.mes_doc_label) toggleFilter('mes_doc_label', item.mes_doc_label) }}>
                {item.fdoc ? new Date(item.fdoc).toLocaleDateString('es-ES') : ''}
              </td>
              <td className={`px-2 py-0.5 text-[9px] font-semibold cursor-pointer hover:underline ${item.dias_vencidos > 0 ? 'text-red-500' : (dark ? 'text-slate-300' : 'text-slate-700')}`} onClick={() => toggleFilter('mes_label', item.mes_label)}>
                {item.vencimiento.toLocaleDateString('es-ES')}
              </td>
              
              {/* Económicos */}
              <td className={`px-2 py-0.5 text-[9px] text-right ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                {formatCur(item.importe)}
              </td>
              <td className={`px-2 py-0.5 text-[9px] text-right ${dark ? 'text-green-500/80' : 'text-green-600'}`}>
                {formatCur(item.cobrado)}
              </td>
              <td className={`px-3 py-0.5 text-[10px] text-right font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {formatCur(item.pendiente)}
              </td>
              
              {/* Datos Pago */}
              <td 
                className={`px-3 py-0.5 text-[9px] font-semibold tracking-wider cursor-pointer hover:underline ${dark ? 'text-slate-300' : 'text-slate-600'}`}
                onClick={() => toggleFilter('forma_pago', item.forma_pago)}
              >
                {item.forma_pago}
              </td>
              <td className={`px-2 py-0.5 text-[9px] truncate max-w-[100px] ${dark ? 'text-slate-400' : 'text-slate-500'}`} title={item.condicion_pago || ''}>
                {item.condicion_pago || '-'}
              </td>
              <td 
                className={`px-3 py-0.5 text-[9px] font-bold cursor-pointer hover:font-black ${dark ? 'text-teal-400' : 'text-teal-700'}`}
                onClick={() => toggleFilter('entidad', item.entidad)}
              >
                {item.entidad}
              </td>
              
              <td 
                 className={`px-2 py-0.5 text-[9px] truncate max-w-[100px] cursor-pointer hover:font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`} 
                 title={item.contrato || ''}
                 onClick={() => { if(item.contrato) toggleFilter('contrato', item.contrato.split(',')[0].trim().toUpperCase()) }}
              >
                {item.contrato || '-'}
              </td>
              
              {/* Etiquetas y Alertas */}
              <td className="px-3 py-0.5">
                <div className="flex flex-wrap gap-1 items-center max-w-[250px] overflow-visible">
                  {item.gestion && (
                    <div className="relative group/tooltip flex items-center">
                      <span 
                        onClick={() => toggleFilter('gestion', 'SÍ')}
                        className={`cursor-pointer px-1 py-0 rounded-[3px] text-[7px] font-bold uppercase tracking-widest border hover:brightness-125 ${dark ? 'bg-orange-950/60 text-orange-400 border-orange-900/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}
                        title={item.comentario || 'Asunto en gestión (sin comentarios adjuntos)'}
                      >
                        GESTIÓN
                      </span>
                      <div className="absolute hidden group-hover/tooltip:block z-50 bottom-full mb-1 left-1/2 -translate-x-1/2 w-64 p-2 text-[10px] sm:text-xs font-normal whitespace-pre-wrap rounded-lg shadow-xl shadow-black/50 border pointer-events-none break-words bg-slate-800 text-slate-200 border-slate-600">
                        {item.comentario || 'Asunto en gestión (sin comentarios adjuntos)'}
                      </div>
                    </div>
                  )}
                  {item.retencion && (
                    <span 
                      onClick={() => toggleFilter('retencion', 'SÍ')}
                      className={`cursor-pointer px-1 py-0 rounded-[3px] text-[7px] font-bold uppercase tracking-widest border hover:brightness-125 ${dark ? 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}
                    >
                      RET
                    </span>
                  )}
                  {item.tag_list.slice(0, 2).map((tag, i) => (
                    <span 
                      key={i} 
                      onClick={() => toggleFilter('etiquetas', tag)}
                      className={`cursor-pointer px-1 py-0 rounded-[3px] text-[7px] font-bold uppercase tracking-widest border hover:brightness-150 ${dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tag_list.length > 2 && (
                    <span className={`px-1 py-0 rounded-[3px] text-[7px] font-bold border ${dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
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
