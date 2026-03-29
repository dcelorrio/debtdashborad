// Processing logic for Debt Dashboard
export interface ProcessedDebtRecord {
  cliente: string;
  cod_cliente: string;
  nfactura: string;
  fvencimiento: string;
  fdoc: string | null;
  mes_doc: number | null;
  importe: number;
  cobrado: number;
  pendiente: number;
  forma_pago: string;
  doc_pago: string | null;
  etiquetas: string | null;
  tag_list: string[]; // Individual tags (excluding Z_)
  z_tags: string[];   // Z_ tags used for contracts
  retencion: boolean;
  gestion: boolean;
  vencido: boolean;
  cargo_abono: string;
  anyo: number;
  mes: number;
  entidad: string;
  idempresa: number;
  empresa: string;
  contrato: string | null;
  vencimiento: Date;
  dias_vencidos: number;
}

export const processRecord = (record: any): ProcessedDebtRecord => {
  const fv = new Date(record.fvencimiento);
  const fd = record.fdoc ? new Date(record.fdoc) : null;
  const now = new Date();
  
  const diffTime = now.getTime() - fv.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Process Tags
  const rawTags = (record.etiquetas || '').split(',').map((s: string) => s.trim()).filter(Boolean);
  const z_tags = rawTags.filter((t: string) => t.toUpperCase().startsWith('Z_')).map((t: string) => t.toUpperCase());
  const tag_list = rawTags.filter((t: string) => !t.toUpperCase().startsWith('Z_')).map((t: string) => t.toUpperCase());

  // Payment Method Normalization (Strict Uppercase)
  const getMappedPayment = (raw: string): string => {
    const s = String(raw || '').toUpperCase();
    if (s.includes('CONFIRMING')) return 'CONFIRMING';
    if (s.includes('TRANSF') || s.includes('TRANSFER')) return 'TRANSFERENCIA';
    if (s.includes('CONTADO') || s.includes('EFECTIVO')) return 'CONTADO';
    if (s.includes('RECIBO')) return 'RECIBO';
    if (s.includes('PAGARE')) return 'PAGARÉ';
    return s || 'OTROS';
  };

  return {
    ...record,
    cod_cliente: String(record.cod_cliente || ''),
    fdoc: record.fdoc || null,
    mes_doc: fd ? fd.getMonth() + 1 : null,
    vencimiento: fv,
    anyo: fv.getFullYear(),
    mes: fv.getMonth() + 1,
    entidad: record.entidad || 'SIN ENTIDAD',
    dias_vencidos: diffDays > 0 ? diffDays : 0,
    gestion: Boolean(record.gestion === 1 || record.gestion === true),
    retencion: Boolean(record.retencion === 1 || record.retencion === true),
    vencido: Boolean(record.vencido === 1 || record.vencido === true),
    idempresa: Number(record.idempresa || 0),
    empresa: (record.empresa_nombre || 'SIN EMPRESA').toUpperCase(),
    // Logic: Contrato comes from record.contrato OR Z_ tags
    contrato: record.contrato || (z_tags.length > 0 ? z_tags.join(', ') : null),
    tag_list,
    z_tags,
    cargo_abono: record.cargo_abono || (record.importe >= 0 ? 'CARGO' : 'ABONO'),
    doc_pago: record.doc_pago || record.forma_pago,
    forma_pago: getMappedPayment(record.forma_pago)
  };
};
