export interface DebtRecord {
  nombre: string;
  facturas: string;
  forma_pago: string;
  deuda_total: number;
}

export const mockData: DebtRecord[] = [
  {
    nombre: "COBRA INSTALACIONES Y SERVICIOS, S.A.",
    facturas: "252384, 252385, 252400, 252401, 252402, 252404, 252430, 252433",
    forma_pago: "CONFIRMING C",
    deuda_total: 26577.73
  },
  {
    nombre: "LABORATORIOS SAPHIR, S.A.U.",
    facturas: "260183, 260217",
    forma_pago: "CONFIRMING C",
    deuda_total: 23028.26
  },
  {
    nombre: "DICSA",
    facturas: "252449, 260060",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 12984.15
  },
  {
    nombre: "NORTON",
    facturas: "231345, 232502",
    forma_pago: "CONFIRMING C",
    deuda_total: 12892.68
  },
  {
    nombre: "CONGELADOS DE NAVARRA, S.A.U.",
    facturas: "260167, 260171",
    forma_pago: "TALÓN/PAGARÉ C",
    deuda_total: 6191.09
  },
  {
    nombre: "ACSA OBRAS E INFRAESTRUCTURAS, S.A.U (SORIGUE)",
    facturas: "253043",
    forma_pago: "CONFIRMING C",
    deuda_total: 4390
  },
  {
    nombre: "AN S.COOP.",
    facturas: "250503, 250620",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 4380.82
  },
  {
    nombre: "ENERLAND ENGINEERING, S.L.",
    facturas: "253249, 253305",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 3799.4
  },
  {
    nombre: "AYUNTAMIENTO DE LA PUEBLA DE ALFINDEN",
    facturas: "253241, 253274, 253330",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 3751.07
  },
  {
    nombre: "PASTAS ARRUABARRENA",
    facturas: "260244, 260282, 260412, 260413, 260454",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 2914.13
  },
  {
    nombre: "BODEGAS RIOJANAS, S.A.",
    facturas: "252428, 252429, 252766",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 2060.55
  },
  {
    nombre: "LEVITEC",
    facturas: "253149",
    forma_pago: "CONFIRMING C",
    deuda_total: 1796.85
  },
  {
    nombre: "JOHN PYE SUBASTAS",
    facturas: "260487",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 1564.3
  },
  {
    nombre: "MONCOBRA",
    facturas: "260135",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 1388.26
  },
  {
    nombre: "SILOS ARAGONESES DE CANFRANC, S.A.",
    facturas: "260354",
    forma_pago: "TRANSFERENCIA C",
    deuda_total: 994.8
  }
];
