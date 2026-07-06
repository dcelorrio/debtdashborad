import React from 'react';
import { X, RefreshCw } from 'lucide-react';

interface InvoiceLine {
  idlfacturacli: number;
  codigo: string;
  descripcion: string;
  unidades: number;
  precio: number;
  dto: number;
  dto2: number;
  importe: number;
  iva: number;
  subsistema: string | null;
  idglfacturacli: number | null;
  grupo_descripcion: string | null;
  grupo_orden: number | null;
}

interface InvoiceHeader {
  idfacturacli: number;
  nfactura: number;
  ffactura: string;
  foperacion: string;
  fcontable: string;
  fcobro: string | null;
  cliente_nif: string;
  cliente_nombre: string;
  idcliente: number;
  empresa_nombre: string;
  delegacion_nombre: string;
  serie_codigo: string;
  banco_precio_nombre: string | null;
  forma_pago_nombre: string;
  condicion_pago_nombre: string;
  caja_nombre: string | null;
  regimen_fiscal_nombre: string;
  tipo_factura_nombre: string;
  estado_fiscal_codigo: number;
  observaciones: string | null;
  idasiento: number | null;
  fenvio: string | null;
  estado_deuda_codigo: number | null;
  total_bruto: number;
  dto_porcentaje: number;
  total_descuento: number;
  total_neto: number;
  total_impuestos: number;
  total_factura: number;
  total_retencion: number;
  porcentaje_garantia: number;
  plazo_garantia: string | null;
  tipo_garantia_nombre: string | null;
}

interface InvoiceDetails {
  header: InvoiceHeader;
  lines: InvoiceLine[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  invoice: InvoiceDetails | null;
  dark?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  loading,
  error,
  invoice
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateStr;
    }
  };

  const formatCur = (val: number) => {
    return (val || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const formatPct = (val: number) => {
    return (val || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  };

  // Mapeos de Estado Fiscal
  const estFiscal = invoice?.header.fenvio 
    ? 'Comunicada' 
    : (invoice?.header.idasiento ? 'Confirmada' : 'Borrador');

  // Mapeos de Estado Deuda
  const getEstDeuda = () => {
    const cod = invoice?.header.estado_deuda_codigo;
    if (cod === 1) return 'Pendiente';
    if (cod === 2) return 'Cobrada';
    if (cod === 3) return 'Dudoso cobro';
    if (cod === 4) return 'Incobrable';
    return 'Sin deuda';
  };
  const estDeuda = getEstDeuda();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Ventana de estilo Beta10 ERP - Temática Gris Clásica con Altura Incrementada */}
      <div className="w-full max-w-6xl rounded border border-slate-400 bg-[#f0f0f0] text-slate-800 shadow-2xl flex flex-col overflow-hidden font-sans text-[11px] h-[85vh]">
        
        {/* Barra de Título */}
        <div className="px-3 py-1.5 flex items-center justify-between select-none bg-[#005a9e] text-white border-b border-[#004578] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide text-xs">Mantenimiento de facturas de cliente</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-0.5 rounded hover:bg-red-600 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Contenido Principal con flex-1 y min-h-0 para permitir encogimiento */}
        <div className="flex-1 p-3 flex flex-col min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <RefreshCw size={24} className="animate-spin text-indigo-500" />
              <span className="font-semibold text-slate-500">Recuperando detalles de la factura de base de datos Oracle...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700 flex flex-col gap-2 shadow-sm shrink-0">
              <span className="font-bold">Error al cargar factura:</span>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && invoice && (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              
              {/* Formulario Cabecera de Dos Columnas (Sección de campos + Totales) - shrink-0 para evitar que se reduzca */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start shrink-0">
                
                {/* 3 Columnas para campos de formulario */}
                <div className="lg:col-span-3 space-y-1.5">
                  
                  {/* Fila 1: Empresa & Delegación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Empresa</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.empresa_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Delegación</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.delegacion_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Fechas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <label className="w-20 md:w-20 font-sans text-right shrink-0 text-slate-700">Fecha factura</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={formatDate(invoice.header.ffactura)}
                        className="w-full px-2 py-0.5 text-center rounded border border-slate-350 bg-white text-slate-800 outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 md:w-20 font-sans text-right shrink-0 text-slate-700">Fecha operación</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={formatDate(invoice.header.foperacion)}
                        className="w-full px-2 py-0.5 text-center rounded border border-slate-350 bg-white text-slate-800 outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-16 font-sans text-right shrink-0 text-slate-700">F. Contable</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={formatDate(invoice.header.fcontable)}
                        className="w-full px-2 py-0.5 text-center rounded border border-slate-350 bg-white text-slate-800 outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-16 font-sans text-right shrink-0 text-slate-700">Fecha cobro</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={formatDate(invoice.header.fcobro)}
                        className="w-full px-2 py-0.5 text-center rounded border border-slate-350 bg-white text-slate-800 outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Fila 3: Serie, Nº, Estado Fiscal, Estado Deuda */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <label className="w-20 md:w-20 font-sans text-right shrink-0 text-slate-700">Serie</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.serie_codigo || ''}
                        className="w-full px-2 py-0.5 text-center font-mono rounded border border-slate-350 bg-white text-slate-855 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 md:w-20 font-sans text-right shrink-0 text-slate-700">Nº</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.nfactura || ''}
                        className="w-full px-2 py-0.5 font-mono font-bold text-red-700 rounded border border-slate-350 bg-white outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-16 font-sans text-right shrink-0 text-[#005a9e] font-bold">Est. Fiscal</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={estFiscal}
                        className="w-full px-2 py-0.5 text-center font-bold text-[#005a9e] rounded border border-slate-350 bg-[#eef6fc] outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-16 font-sans text-right shrink-0 text-[#a4373a] font-bold">Est. Deuda</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={estDeuda}
                        className="w-full px-2 py-0.5 text-center font-bold text-[#a4373a] rounded border border-slate-350 bg-[#fdf3f3] outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Fila 4: Cliente */}
                  <div className="flex items-center gap-2">
                    <label className="w-20 font-sans text-right shrink-0 text-slate-700">Cliente</label>
                    <div className="flex w-full gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.idcliente || ''}
                        className="w-16 px-2 py-0.5 text-center font-mono rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.cliente_nombre || ''}
                        className="w-full px-2 py-0.5 font-semibold rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-semibold px-1 text-slate-700">NIF</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={invoice.header.cliente_nif || ''}
                          className="w-24 px-2 py-0.5 font-mono text-center rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fila 5: Banco Precios, Forma Pago, Condicion Pago */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Banco precios</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.banco_precio_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Forma de pago</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.forma_pago_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-855 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Condición pago</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.condicion_pago_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Fila 6: Caja, Tipo Factura, Régimen Fiscal */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Caja</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.caja_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Tipo de factura</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.tipo_factura_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-20 font-sans text-right shrink-0 text-slate-700">Régimen fiscal</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.header.regimen_fiscal_nombre || ''}
                        className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Fila 7: Campo de Retenciones por Garantía de Obra */}
                  <div className="p-1.5 rounded border border-slate-300 bg-[#f9f9f9]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-slate-500 pr-1 border-r border-slate-300 mr-1">Retenciones Garantía Obra</span>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-[10px]">Tipo:</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={invoice.header.tipo_garantia_nombre || 'Sin retención'}
                          className="w-48 px-1.5 py-0.5 border border-slate-300 bg-white text-slate-800 text-[10px] rounded"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-[10px]">Retención %:</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={invoice.header.porcentaje_garantia > 0 ? formatPct(invoice.header.porcentaje_garantia) : '0,00 %'}
                          className="w-16 px-1.5 py-0.5 border border-slate-300 bg-white text-slate-800 font-mono text-[10px] text-right rounded"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-[10px]">Importe:</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={formatCur(invoice.header.total_retencion)}
                          className="w-24 px-1.5 py-0.5 border border-slate-300 bg-white text-slate-800 font-mono text-[10px] text-right rounded"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-[10px]">Plazo:</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={formatDate(invoice.header.plazo_garantia)}
                          className="w-20 px-1.5 py-0.5 border border-slate-300 bg-white text-slate-800 font-mono text-[10px] text-center rounded"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 pl-2">
                        <input 
                          type="checkbox" 
                          disabled 
                          checked={invoice.header.porcentaje_garantia > 0}
                          className="rounded border-slate-300"
                        />
                        <span className="text-[10px] text-slate-600 font-bold">Factura</span>
                      </div>

                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                        <input 
                          type="checkbox" 
                          disabled 
                          checked={invoice.header.estado_fiscal_codigo !== 1}
                          className="rounded border-slate-350 bg-white"
                        />
                        <span className="text-[10px] text-slate-600 font-bold">Exportada</span>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="flex items-start gap-2">
                    <label className="w-20 font-sans text-right shrink-0 pt-0.5 text-slate-700">Observaciones</label>
                    <textarea 
                      readOnly 
                      value={invoice.header.observaciones || ''}
                      rows={1}
                      className="w-full px-2 py-0.5 rounded border border-slate-350 bg-white text-slate-800 outline-none resize-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* 1 Columna: Panel de Totales e Importes */}
                <div className="lg:col-span-1 space-y-2 shrink-0">
                  <div className="border border-slate-350 rounded p-2 bg-[#f5f5f5] space-y-1 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 pb-0.5 mb-1.5">Importes factura</div>
                    
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-600">Bruto</span>
                      <span className="font-mono text-slate-800">{formatCur(invoice.header.total_bruto)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-600">Dto. ({formatPct(invoice.header.dto_porcentaje)})</span>
                      <span className="font-mono text-red-700">{formatCur(invoice.header.total_descuento)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-600">Retenciones</span>
                      <span className="font-mono text-slate-800">{formatCur(0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10.5px] border-t border-slate-300 pt-0.5">
                      <span className="text-slate-600 font-semibold">Subtotal</span>
                      <span className="font-mono font-semibold text-slate-855">{formatCur(invoice.header.total_neto)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-600">Impuestos (21%)</span>
                      <span className="font-mono text-slate-800">{formatCur(invoice.header.total_impuestos)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-600">Retenciones</span>
                      <span className="font-mono text-slate-800">{formatCur(0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-450 pt-1 text-slate-900 bg-[#e2e2e2] px-1.5 py-0.5 rounded shadow-inner">
                      <span>Total</span>
                      <span className="font-mono text-xs text-red-800">{formatCur(invoice.header.total_factura)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rejilla de Líneas de Factura - flex-grow y flex-1 min-h-0 para expandirse dinámicamente */}
              <div className="border border-slate-350 rounded overflow-hidden flex flex-col bg-white flex-grow flex-1 min-h-0">
                
                {/* Tabla de Líneas */}
                <div className="overflow-auto flex-1 bg-white">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="text-[9.5px] uppercase font-bold sticky top-0 z-10 bg-slate-100 text-slate-600 border-b border-slate-300 select-none">
                      <tr>
                        <th className="px-3 py-1.5 border-r border-slate-250">Subsistema</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 w-24">Código</th>
                        <th className="px-3 py-1.5 border-r border-slate-250">Descripción</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 text-right w-16">Unidades</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 text-right w-20">Precio</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 text-right w-16">Descuento</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 text-right w-16">Descuento 2</th>
                        <th className="px-3 py-1.5 border-r border-slate-250 text-right w-24">Importe</th>
                        <th className="px-3 py-1.5 text-center w-12">IVA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[10px] font-mono bg-white text-slate-800">
                      {(() => {
                        const rows: React.ReactNode[] = [];
                        let lastGroupId: number | null = null;
                        
                        // Precalcular totales por grupo y ordenar ids únicos de grupo
                        const groupTotals: { [key: number]: number } = {};
                        const uniqueGroupIds: number[] = [];
                        
                        invoice.lines.forEach(line => {
                          if (line.idglfacturacli) {
                            groupTotals[line.idglfacturacli] = (groupTotals[line.idglfacturacli] || 0) + (line.importe || 0);
                            if (!uniqueGroupIds.includes(line.idglfacturacli)) {
                              uniqueGroupIds.push(line.idglfacturacli);
                            }
                          }
                        });

                        invoice.lines.forEach((line) => {
                          if (line.idglfacturacli && line.idglfacturacli !== lastGroupId) {
                            lastGroupId = line.idglfacturacli;
                            const groupNum = uniqueGroupIds.indexOf(line.idglfacturacli) + 1;
                            rows.push(
                              <tr 
                                key={`group-header-${line.idglfacturacli}`} 
                                className="bg-[#e9e9e9] text-slate-900 font-sans font-bold text-[10px] border-y border-slate-300 select-none hover:bg-slate-200"
                              >
                                <td colSpan={9} className="px-3 py-1 border-r border-slate-200">
                                  Grupo : {String(groupNum).padStart(2, '0')} {line.grupo_descripcion || 'Concepto'} ({formatCur(groupTotals[line.idglfacturacli] || 0)})
                                </td>
                              </tr>
                            );
                          } else if (!line.idglfacturacli && lastGroupId !== null) {
                            lastGroupId = null; // reset if a line has no group
                          }

                          rows.push(
                            <tr key={line.idlfacturacli} className="hover:bg-blue-500/5">
                              {/* Subsistema */}
                              <td className="px-3 py-0.5 border-r border-slate-200 max-w-[200px] truncate text-[9.5px] font-sans text-slate-600 font-semibold" title={line.subsistema || ''}>
                                {line.subsistema || '-'}
                              </td>
                              
                              {/* Código */}
                              <td className="px-3 py-0.5 border-r border-slate-200 font-bold text-slate-900">
                                {line.codigo}
                              </td>
                              
                              {/* Descripción */}
                              <td className="px-3 py-0.5 border-r border-slate-200 font-sans font-semibold max-w-[350px] truncate text-slate-800" title={line.descripcion}>
                                {line.descripcion}
                              </td>
                              
                              {/* Unidades */}
                              <td className="px-3 py-0.5 border-r border-slate-200 text-right font-semibold text-slate-900">
                                {line.unidades.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              
                              {/* Precio */}
                              <td className="px-3 py-0.5 border-r border-slate-200 text-right text-slate-500">
                                {line.precio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              
                              {/* Dto */}
                              <td className="px-3 py-0.5 border-r border-slate-200 text-right text-red-655">
                                {line.dto > 0 ? line.dto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %' : '0,00 %'}
                              </td>
                              
                              {/* Dto 2 */}
                              <td className="px-3 py-0.5 border-r border-slate-200 text-right text-red-655">
                                {line.dto2 > 0 ? line.dto2.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %' : '0,00 %'}
                              </td>
                              
                              {/* Importe */}
                              <td className="px-3 py-0.5 border-r border-slate-200 text-right font-bold text-slate-900">
                                {formatCur(line.importe)}
                              </td>
                              
                              {/* IVA */}
                              <td className="px-3 py-0.5 text-center font-semibold text-slate-700">
                                {line.iva} %
                              </td>
                            </tr>
                          );
                        });

                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
