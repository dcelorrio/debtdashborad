import { create } from 'zustand';

export type FilterKey = 
  | 'anyo' | 'mes' | 'forma_pago' | 'mes_doc' | 'cliente' | 'doc_pago' 
  | 'cargo_abono' | 'vencido' | 'retencion' | 'importe' | 'contrato' 
  | 'entidad' | 'cod_cliente' | 'etiquetas' | 'gestion' | 'idempresa' | 'empresa' | 'nfactura'
  | 'mes_label' | 'mes_doc_label';

interface DashboardStore {
  filters: Record<FilterKey, (string | number)[]>;
  isDarkMode: boolean;

  toggleFilter: (key: FilterKey, value: string | number) => void;
  setFilter: (key: FilterKey, values: (string | number)[]) => void;
  clearFilter: (key: FilterKey) => void;
  toggleDarkMode: () => void;
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
  mes_label: [], mes_doc_label: []
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: { ...initialFilters },
  isDarkMode: true,

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
