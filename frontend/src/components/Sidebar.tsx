import { useMemo, useState } from 'react';
import { useDashboardStore, FilterKey } from '../store/useDashboardStore';
import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { 
  Filter, 
  Trash2, 
  Database, 
  ChevronRight
} from 'lucide-react';

interface FilterListProps {
  label: string;
  options: { val: string | number; isPossible: boolean }[];
  selectedValues: (string | number)[];
  onToggle: (val: string | number) => void;
  onClear: () => void;
  dark: boolean;
}

const FilterList = ({ label, options, selectedValues, onToggle, onClear, dark }: FilterListProps) => {
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
           <button 
             onClick={(e) => { e.stopPropagation(); onClear(); }}
             className="text-slate-600 hover:text-red-500 transition-colors p-1"
           >
             <Trash2 size={13} />
           </button>
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
  const { filters, toggleFilter, clearFilter, clearAll, isDarkMode: dark } = useDashboardStore();

  const options = useMemo(() => {
    const getDataExcluding = (excludeKeys: FilterKey[]) => {
      return data.filter(item => {
        for (const [key, selected] of Object.entries(filters)) {
          if (excludeKeys.includes(key as FilterKey)) continue;
          if (selected.length === 0) continue;
          
          if (key === 'empresa' && !selected.includes(item.empresa)) return false;
          if (key === 'anyo' && item.anyo !== null && !selected.includes(item.anyo)) return false;
          if (key === 'mes' && item.mes !== null && !selected.includes(item.mes)) return false;
          if (key === 'mes_doc' && item.mes_doc !== null && !selected.includes(item.mes_doc)) return false;
          if (key === 'forma_pago' && !selected.includes(item.forma_pago)) return false;
          if (key === 'entidad' && !selected.includes(item.entidad)) return false;
          if (key === 'cliente' && !selected.includes(item.cliente)) return false;
          if (key === 'vencido' && !selected.includes(item.vencido ? 'SÍ' : 'NO')) return false;
          if (key === 'retencion' && !selected.includes(item.retencion ? 'SÍ' : 'NO')) return false;
          if (key === 'gestion' && !selected.includes(item.gestion ? 'SÍ' : 'NO')) return false;
          if (key === 'etiquetas' && !item.tag_list.some(t => selected.includes(t as string))) return false;
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
      mes: getOptionsForDimension('mes', 'mes'),
      forma_pago: getOptionsForDimension('forma_pago', 'forma_pago'),
      entidad: getOptionsForDimension('entidad', 'entidad'),
      mes_doc: getOptionsForDimension('mes_doc', 'mes_doc'),
      cliente: getOptionsForDimension('cliente', 'cliente'),
      vencido: [{val: 'SÍ', isPossible: getDataExcluding(['vencido']).some(i => i.vencido)}, {val: 'NO', isPossible: getDataExcluding(['vencido']).some(i => !i.vencido)}],
      retencion: [{val: 'SÍ', isPossible: getDataExcluding(['retencion']).some(i => i.retencion)}, {val: 'NO', isPossible: getDataExcluding(['retencion']).some(i => !i.retencion)}],
      gestion: [{val: 'SÍ', isPossible: getDataExcluding(['gestion']).some(i => i.gestion)}, {val: 'NO', isPossible: getDataExcluding(['gestion']).some(i => !i.gestion)}],
      empresa: getOptionsForDimension('empresa', 'empresa'),
      contrato: [], // Simplified for now to fix build
      etiquetas: []
    };
  }, [data, filters]);

  const filterRows: { key: FilterKey; label: string }[] = [
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'anyo', label: 'EJERCICIO' },
    { key: 'mes', label: 'MES VECTO.' },
    { key: 'mes_doc', label: 'MES DOC.' },
    { key: 'entidad', label: 'ENTIDAD' },
    { key: 'forma_pago', label: 'FORMA PAGO' },
    { key: 'gestion', label: 'EN GESTIÓN' },
    { key: 'cliente', label: 'CLIENTE' },
    { key: 'vencido', label: 'VENCIDO' },
    { key: 'retencion', label: 'RETENCIÓN' },
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
            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>INTELLIGENCE</p>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-4 scrollbar-hide">
        <div className="flex items-center gap-3 mb-6 px-8">
          <Filter size={15} className="text-blue-500" />
          <span className={`text-[11px] font-bold uppercase tracking-[0.5em] ${dark ? 'text-slate-700' : 'text-slate-400'}`}>DIMENSIONES</span>
        </div>

        {filterRows.map(row => (
          <FilterList
            key={row.key}
            label={row.label}
            options={(options as any)[row.key]}
            selectedValues={filters[row.key]}
            onToggle={(val) => toggleFilter(row.key, val)}
            onClear={() => clearFilter(row.key)}
            dark={dark}
          />
        ))}
      </div>

      <div className={`p-6 border-t ${dark ? 'border-white/[0.05]' : 'border-slate-100'}`}>
        <button
          onClick={clearAll}
          className={`w-full py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
            dark 
              ? 'bg-red-950/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white shadow-lg' 
              : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-600 hover:text-white shadow-md'
          }`}
        >
          <Trash2 size={15} />
          LIMPIAR TODO
        </button>
      </div>
    </aside>
  );
};
