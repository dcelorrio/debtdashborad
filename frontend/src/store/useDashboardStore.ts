import { create } from 'zustand';

export type FilterKey = 
  | 'anyo' | 'mes' | 'forma_pago' | 'mes_doc' | 'cliente' | 'doc_pago' 
  | 'cargo_abono' | 'vencido' | 'retencion' | 'importe' | 'contrato' 
  | 'entidad' | 'cod_cliente' | 'etiquetas' | 'gestion' | 'idempresa' | 'empresa' | 'nfactura'
  | 'mes_label' | 'mes_doc_label' | 'abono' | 'pendiente';

interface DashboardStore {
  filters: Record<FilterKey, (string | number)[]>;
  isDarkMode: boolean;
  hoveredComment: string | null;

  toggleFilter: (key: FilterKey, value: string | number) => void;
  setFilter: (key: FilterKey, values: (string | number)[]) => void;
  clearFilter: (key: FilterKey) => void;
  invertFilter: (key: FilterKey, allPossibleValues: (string | number)[]) => void;
  invertAllActiveFilters: (dataMap: Record<FilterKey, (string | number)[]>) => void;
  toggleDarkMode: () => void;
  setHoveredComment: (comment: string | null) => void;
  clearAll: () => void;
  
  // Legacy aliases for components not updated yet
  setSelectedYear: (val: number | null) => void;
  setSelectedEntity: (val: string | null) => void;
  setSelectedGestion: (val: boolean | null) => void;
}

const initialFilters: Record<FilterKey, (string | number)[]> = {
  anyo: [], mes: [], forma_pago: [], mes_doc: [], cliente: [], doc_pago: [],
  cargo_abono: [], vencido: [], retencion: [], importe: [], contrato: [],
  entidad: [], cod_cliente: [], etiquetas: [], gestion: [], idempresa: [], empresa: [], nfactura: [],
  mes_label: [], mes_doc_label: [], abono: [], pendiente: []
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: { ...initialFilters },
  isDarkMode: true,
  hoveredComment: null,

  toggleFilter: (key, value) => set((state) => {
    const current = state.filters[key];
    const next = current.includes(value) 
      ? current.filter(v => v !== value) 
      : [...current, value];
    return { filters: { ...state.filters, [key]: next } };
  }),

  setFilter: (key, values) => set((state) => ({
    filters: { ...state.filters, [key]: values }
  })),

  clearFilter: (key) => set((state) => ({
    filters: { ...state.filters, [key]: [] }
  })),

  setHoveredComment: (comment) => set({ hoveredComment: comment }),

  invertFilter: (key, allPossibleValues) => set((state) => {
    const current = state.filters[key];
    if (current.length === 0) return state; // Only invert active filters
    const inverted = allPossibleValues.filter(val => !current.includes(val));
    return { filters: { ...state.filters, [key]: inverted } };
  }),

  invertAllActiveFilters: (dataMap) => set((state) => {
    const nextFilters = { ...state.filters };
    let changed = false;
    for (const key of Object.keys(state.filters) as FilterKey[]) {
      if (state.filters[key].length > 0 && dataMap[key]) {
        nextFilters[key] = dataMap[key].filter(val => !state.filters[key].includes(val));
        changed = true;
      }
    }
    return changed ? { filters: nextFilters } : state;
  }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  clearAll: () => set({ filters: { ...initialFilters } }),

  // Legacy Compatibility
  setSelectedYear: (val) => set((state) => ({ 
    filters: { ...state.filters, anyo: val === null ? [] : [val] } 
  })),
  setSelectedEntity: (val) => set((state) => ({ 
    filters: { ...state.filters, entidad: val === null ? [] : [val] } 
  })),
  setSelectedGestion: (val) => set((state) => ({ 
    filters: { ...state.filters, gestion: val === null ? [] : [val ? 'SÍ' : 'NO'] } 
  })),
}));
