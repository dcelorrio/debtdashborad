import { useMemo, useState } from 'react';
import { useDashboardStore, FilterKey } from '../store/useDashboardStore';
import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { 
  Filter, 
  Trash2, 
  Database, 
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';

interface FilterListProps {
  label: string;
  options: { val: string | number; isPossible: boolean }[];
  selectedValues: (string | number)[];
  onToggle: (val: string | number) => void;
  onClear: () => void;
  onInvert?: () => void;
  dark: boolean;
}

const FilterList = ({ label, options, selectedValues, onToggle, onClear, onInvert, dark }: FilterListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = selectedValues.length > 0;
  
  return (
    <div className={`mb-0.5 transition-all duration-300 ${dark ? 'border-b border-white/[0.03]' : 'border-b border-slate-100'}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-3 px-6 cursor-pointer group hover:bg-emerald-500/[0.04]"
      >
        <div className="flex items-center gap-3">
           <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
              <ChevronRight size={13} className={isActive ? 'text-emerald-500 shadow-[0_0_8px_#10b981]' : 'text-slate-600'} />
           </div>
           <span className={`text-[12px] font-bold uppercase tracking-[0.15em] ${
             isActive ? 'text-emerald-500' : dark ? 'text-slate-300' : 'text-slate-800'
           }`}>
             {label.toUpperCase()}
             {isActive && (
               <span className="ml-3 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8.5px] font-bold">
                 {selectedValues.length}
               </span>
             )}
           </span>
        </div>
        {isActive && (
           <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
             {onInvert && (
               <button 
                 onClick={onInvert}
                 className="text-slate-600 hover:text-blue-500 transition-colors p-1"
                 title="Invertir selección"
               >
                 <ArrowRightLeft size={13} />
               </button>
             )}
             <button 
               onClick={onClear}
               className="text-slate-600 hover:text-red-500 transition-colors p-1"
               title="Borrar filtro"
             >
               <Trash2 size={13} />
             </button>
           </div>
        )}
      </div>

      {isOpen && (
        <div className={`px-6 pb-2 max-h-80 overflow-y-auto ${dark ? 'bg-slate-950/40' : 'bg-slate-50/50'} scrollbar-hide`}>
          <div className="space-y-0.5 pt-1">
            {options.filter(o => o.isPossible || selectedValues.includes(o.val)).map(opt => {
              const selected = selectedValues.includes(opt.val);
              return (
                <div 
                  key={String(opt.val)}
                  onClick={() => onToggle(opt.val)}
                  className={`px-4 py-1.5 rounded-xl cursor-pointer text-[11px] font-semibold flex items-center gap-3 transition-all ${
                    selected 
                      ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_15px_#10b98115] ring-1 ring-emerald-500/20' 
                      : (dark ? 'text-slate-200 hover:bg-slate-900/50' : 'text-slate-950 hover:bg-slate-200')
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    selected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-400'
                  }`} />
                  <span className="truncate uppercase tracking-tight">{opt.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ data }: { data: ProcessedDebtRecord[] }) => {
  const { filters, toggleFilter, clearFilter, clearAll, invertFilter, invertAllActiveFilters, isDarkMode: dark } = useDashboardStore();

  const options = useMemo(() => {
    const getDataExcluding = (excludeKeys: FilterKey[]) => {
      return data.filter(item => {
        for (const [key, selected] of Object.entries(filters)) {
          if (excludeKeys.includes(key as FilterKey)) continue;
          if (selected.length === 0) continue;
          
          if (key === 'empresa' && !selected.includes(item.empresa)) return false;
          if (key === 'anyo' && item.anyo !== null && !selected.includes(item.anyo)) return false;
          if (key === 'mes_label' && !selected.includes(item.mes_label)) return false;
          if (key === 'mes_doc_label' && (item.mes_doc_label === null || !selected.includes(item.mes_doc_label))) return false;
          if (key === 'forma_pago' && !selected.includes(item.forma_pago)) return false;
          if (key === 'entidad' && !selected.includes(item.entidad)) return false;
          if (key === 'cliente' && !selected.includes(item.cliente)) return false;
          if (key === 'vencido' && !selected.includes(item.vencido ? 'SÍ' : 'NO')) return false;
          if (key === 'retencion' && !selected.includes(item.retencion ? 'SÍ' : 'NO')) return false;
          if (key === 'gestion' && !selected.includes(item.gestion ? 'SÍ' : 'NO')) return false;
          if (key === 'etiquetas' && !item.tag_list.some(t => selected.includes(t as string))) return false;
          if (key === 'abono' && !selected.includes(item.abono)) return false;
        }
        return true;
      });
    };

    const getOptionsForDimension = (key: keyof ProcessedDebtRecord, filterKey: FilterKey) => {
      const allSet = new Set<string | number>();
      const contextData = getDataExcluding([filterKey]);
      const possibleSet = new Set<string | number>();
      
      data.forEach(item => {
        const val = item[key];
        if (val !== null && val !== undefined) {
          const formatted = typeof val === 'boolean' ? (val ? 'SÍ' : 'NO') : String(val).toUpperCase();
          const final: string | number = isNaN(Number(formatted)) ? formatted : Number(formatted);
          allSet.add(final);
        }
      });

      contextData.forEach(item => {
        const val = item[key];
        if (val !== null && val !== undefined) {
           const formatted = typeof val === 'boolean' ? (val ? 'SÍ' : 'NO') : String(val).toUpperCase();
           const final: string | number = isNaN(Number(formatted)) ? formatted : Number(formatted);
           possibleSet.add(final);
        }
      });

      return Array.from(allSet).sort().map(val => ({
        val,
        isPossible: possibleSet.has(val)
      }));
    };

    return {
      anyo: getOptionsForDimension('anyo', 'anyo'),
      mes_label: getOptionsForDimension('mes_label', 'mes_label'),
      forma_pago: getOptionsForDimension('forma_pago', 'forma_pago'),
      entidad: getOptionsForDimension('entidad', 'entidad'),
      mes_doc_label: getOptionsForDimension('mes_doc_label', 'mes_doc_label'),
      cliente: getOptionsForDimension('cliente', 'cliente'),
      vencido: [{val: 'SÍ', isPossible: getDataExcluding(['vencido']).some(i => i.vencido)}, {val: 'NO', isPossible: getDataExcluding(['vencido']).some(i => !i.vencido)}],
      retencion: [{val: 'SÍ', isPossible: getDataExcluding(['retencion']).some(i => i.retencion)}, {val: 'NO', isPossible: getDataExcluding(['retencion']).some(i => !i.retencion)}],
      gestion: [{val: 'SÍ', isPossible: getDataExcluding(['gestion']).some(i => i.gestion)}, {val: 'NO', isPossible: getDataExcluding(['gestion']).some(i => !i.gestion)}],
      empresa: getOptionsForDimension('empresa', 'empresa'),
      abono: [{val: 'SÍ', isPossible: getDataExcluding(['abono']).some(i => i.abono === 'SÍ')}, {val: 'NO', isPossible: getDataExcluding(['abono']).some(i => i.abono === 'NO')}],
      contrato: [], // Simplified for now to fix build
      etiquetas: []
    };
  }, [data, filters]);

  const filterRows: { key: FilterKey; label: string }[] = [
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'anyo', label: 'EJERCICIO' },
    { key: 'mes_label', label: 'MES VECTO.' },
    { key: 'mes_doc_label', label: 'MES DOC.' },
    { key: 'entidad', label: 'ENTIDAD' },
    { key: 'forma_pago', label: 'FORMA PAGO' },
    { key: 'gestion', label: 'EN GESTIÓN' },
    { key: 'cliente', label: 'CLIENTE' },
    { key: 'vencido', label: 'VENCIDO' },
    { key: 'retencion', label: 'RETENCIÓN' },
    { key: 'abono', label: 'ABONO/FACT.' },
  ];

  return (
    <aside className={`w-64 h-full flex flex-col border-r shadow-2xl transition-all duration-500 overflow-hidden ${
      dark ? 'bg-slate-950 border-white/[0.05]' : 'bg-slate-50 border-slate-200'
    }`}>
      <div className={`p-8 border-b flex items-center gap-5 ${dark ? 'border-white/[0.05] bg-slate-950/80' : 'border-slate-100 bg-white shadow-xl'}`}>
          <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.4)]">
            <Database size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold tracking-tighter text-blue-500 leading-none">SATYA</h1>
            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>GESTION DEUDA</p>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-4 scrollbar-hide">
        <div className="flex items-center gap-3 mb-6 px-8">
          <Filter size={15} className="text-blue-500" />
          <span className={`text-[11px] font-bold uppercase tracking-[0.5em] ${dark ? 'text-slate-700' : 'text-slate-400'}`}>FILTROS</span>
        </div>

        {filterRows.map(row => {
          const rowOptions = (options as any)[row.key] || [];
          return (
            <FilterList
              key={row.key}
              label={row.label}
              options={rowOptions}
              selectedValues={filters[row.key]}
              onToggle={(val) => toggleFilter(row.key, val)}
              onClear={() => clearFilter(row.key)}
              onInvert={() => invertFilter(row.key, rowOptions.map((o: any) => o.val))}
              dark={dark}
            />
          );
        })}
      </div>

      <div className={`p-4 border-t flex flex-col gap-2 ${dark ? 'border-white/[0.05]' : 'border-slate-100'}`}>
        <button
          onClick={() => {
             const dataMap: any = {};
             filterRows.forEach(r => {
                dataMap[r.key] = ((options as any)[r.key] || []).map((o: any) => o.val);
             });
             invertAllActiveFilters(dataMap);
          }}
          className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all ${
            dark 
              ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 hover:bg-blue-900 hover:text-white' 
              : 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white'
          }`}
        >
          <ArrowRightLeft size={13} />
          INVERTIR ACTIVOS
        </button>
        <button
          onClick={clearAll}
          className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
            dark 
              ? 'bg-red-950/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white shadow-lg' 
              : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-600 hover:text-white shadow-md'
          }`}
        >
          <Trash2 size={13} />
          LIMPIAR TODO
        </button>
      </div>
    </aside>
  );
};
