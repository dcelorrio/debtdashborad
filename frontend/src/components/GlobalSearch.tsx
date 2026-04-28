import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { ProcessedDebtRecord } from '../utils/dataProcessor';
import { useDashboardStore, FilterKey } from '../store/useDashboardStore';

interface GlobalSearchProps {
  data: ProcessedDebtRecord[];
  dark: boolean;
}



interface GroupedMatches {
  [groupLabel: string]: {
    field: FilterKey;
    matches: string[];
    expanded: boolean;
  };
}

export function GlobalSearch({ data, dark }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toggleFilter } = useDashboardStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Custom grouping state to allow collapsing/expanding exactly like Qlik
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Define searchable fields and their human-readable labels
  const searchableFields: { key: FilterKey; label: string }[] = [
    { key: 'cliente', label: 'CLIENTE' },
    { key: 'cod_cliente', label: 'CÓDIGO CLIENTE' },
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'entidad', label: 'ENTIDAD BANCARIA' },
    { key: 'forma_pago', label: 'FORMA PAGO' },
    { key: 'contrato', label: 'CONTRATO' },
    { key: 'nfactura', label: 'Nº FACTURA' },
    { key: 'pendiente', label: 'IMPORTE PENDIENTE' }
  ];

  // Calculate matches dynamically based on query
  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return null;
    
    const searchLower = query.toLowerCase();
    const groups: GroupedMatches = {};
    
    // Initialize groups
    searchableFields.forEach(({ label, key }) => {
      groups[label] = { field: key, matches: [], expanded: expandedGroups[label] !== false }; // Default expanded
    });
    
    // Find unique matches per field
    const uniqueValues: Record<string, Set<string>> = {};
    searchableFields.forEach(f => uniqueValues[f.key] = new Set());
    
    data.forEach(item => {
      searchableFields.forEach(({ key }) => {
        const val = item[key as keyof ProcessedDebtRecord];
        if (val !== undefined && val !== null) {
           let strVal = String(val);
           let matchFound = false;

           if (key === 'pendiente') {
             const numVal = Number(val);
             strVal = numVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
             const strValNoDecimals = numVal.toLocaleString('es-ES', { maximumFractionDigits: 0 });
             // Check if user's search query matches the formatted number with or without decimals
             if (strVal.toLowerCase().includes(searchLower) || strValNoDecimals.toLowerCase().includes(searchLower)) {
               matchFound = true;
             }
           } else {
             if (strVal.toLowerCase().includes(searchLower)) {
               matchFound = true;
             }
           }

           if (matchFound) {
             uniqueValues[key].add(strVal);
           }
        }
      });
    });
    
    // Populate matches
    Object.keys(groups).forEach(label => {
      const fieldData = groups[label];
      fieldData.matches = Array.from(uniqueValues[fieldData.field]).sort().slice(0, 15); // Limit to 15 per category to avoid massive lists
    });
    
    // Filter out empty groups
    const activeGroups: GroupedMatches = {};
    for (const [label, group] of Object.entries(groups)) {
       if (group.matches.length > 0) activeGroups[label] = group;
    }
    
    return activeGroups;
  }, [query, data, expandedGroups]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (field: FilterKey, value: string) => {
    toggleFilter(field, value);
    setQuery('');
    setIsOpen(false);
  };

  const toggleGroup = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroups(prev => ({ ...prev, [label]: prev[label] === false ? true : false }));
  };

  // Helper to highlight matching text
  const HighlightMatch = ({ text }: { text: string }) => {
    if (!query) return <>{text}</>;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <span key={i} className={`${dark ? 'bg-yellow-500/30 text-yellow-200' : 'bg-yellow-200 text-slate-900'} font-bold rounded px-0.5`}>{part}</span> : 
            part
        )}
      </>
    );
  };

  return (
    <div className="relative w-80" ref={wrapperRef}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
        dark 
          ? 'bg-slate-950/50 border-slate-700 text-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500' 
          : 'bg-white border-slate-300 text-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm'
      }`}>
        <Search size={16} className={`opacity-60 ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
        <input 
          type="text" 
          className="bg-transparent border-none outline-none w-full text-sm font-medium tracking-wide"
          placeholder="Buscar clientes, importe, etc..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="opacity-40 hover:opacity-100 text-xs font-bold">✕</button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults && Object.keys(searchResults).length > 0 && (
        <div className={`absolute top-full left-0 mt-2 w-full max-w-md w-[400px] z-[100] rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[60vh] ${
          dark ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-y-auto scrollbar-hide py-1">
            {Object.entries(searchResults).map(([label, group]) => (
              <div key={label} className="flex flex-col">
                {/* Group Header */}
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer border-y first:border-t-0 select-none ${
                    dark ? 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 hover:bg-slate-200/50'
                  }`}
                  onClick={(e) => toggleGroup(label, e)}
                >
                  <button className="opacity-70 focus:outline-none">
                    {group.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {label}: ({group.matches.length})
                  </span>
                </div>
                
                {/* Group Items */}
                {group.expanded && (
                  <div className="flex flex-col py-0.5">
                    {group.matches.map((val, i) => (
                      <div 
                         key={i}
                         className={`px-8 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                           dark ? 'text-slate-200 hover:bg-blue-900/40' : 'text-slate-700 hover:bg-blue-50'
                         }`}
                         onClick={() => handleSelect(group.field, val)}
                      >
                         <HighlightMatch text={val} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State when typing but no results */}
      {isOpen && query.length >= 2 && (!searchResults || Object.keys(searchResults).length === 0) && (
        <div className={`absolute top-full left-0 mt-2 w-full z-[100] rounded-xl border shadow-xl p-4 text-center ${
          dark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <span className="text-sm font-medium">No se encontraron resultados para "{query}"</span>
        </div>
      )}
    </div>
  );
}
