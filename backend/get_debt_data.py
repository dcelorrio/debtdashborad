from oracle_conn import execute_query
import json

def get_debt_report():
    query = """
    SELECT distinct 
        CLIENTE.RAZON_SOCIAL AS CLIENTE, 
        CLIENTE.IDCLIENTE AS COD_CLIENTE,
        DEUDACLI.IDEMPRESA,
        EMPRESA.NOMBRE AS EMPRESA_NOMBRE,
        (SELECT LISTAGG(FACTURACLI.NFACTURA, ', ') WITHIN GROUP (ORDER BY FACTURACLI.NFACTURA) 
         FROM FACTURACLI WHERE FACTURACLI.IDDEUDA=DEUDACLI.IDDEUDACLI) AS NFACTURA,
        (SELECT LISTAGG(FACTURACLI.IDFACTURACLI, ', ') WITHIN GROUP (ORDER BY FACTURACLI.NFACTURA) 
         FROM FACTURACLI WHERE FACTURACLI.IDDEUDA=DEUDACLI.IDDEUDACLI) AS IDFACTURACLI,
        (SELECT MIN(FFACTURA) FROM FACTURACLI WHERE FACTURACLI.IDDEUDA=DEUDACLI.IDDEUDACLI) AS FDOC,
        VENCIMIENTOCLI.FVENCIMIENTO, 
        VENCIMIENTOCLI.IMPORTE, 
        NVL(LCOBRO.IMPORTE, 0) AS COBRADO, 
        (VENCIMIENTOCLI.IMPORTE - NVL(LCOBRO.IMPORTE, 0)) AS PENDIENTE, 
        FORMA_PAGO.DESCRIPCION AS FORMA_PAGO, 
        DEUDACLI.COMENTARIO,
        S1.ETIQUETAS,
        CASE WHEN S1.ETIQUETAS LIKE ('%RET%') THEN 1 ELSE 0 END AS RETENCION, 
        CASE WHEN DEUDACLI.COMENTARIO IS NOT NULL THEN 1 ELSE 0 END AS GESTION,
        CASE WHEN VENCIMIENTOCLI.FVENCIMIENTO < TRUNC(SYSDATE) THEN 1 ELSE 0 END AS VENCIDO,
        CASE WHEN VENCIMIENTOCLI.IMPORTE >= 0 THEN 'CARGO' ELSE 'ABONO' END AS CARGO_ABONO,
        CASE 
            WHEN instr(S1.ETIQUETAS,'PROGRESO')>0 THEN 'PROGRESO' 
            WHEN instr(S1.ETIQUETAS,'PAGADO')>0 THEN 'PAGADO' 
            WHEN instr(S1.ETIQUETAS,'BBVA')>0 THEN 'BBVA' 
            WHEN instr(S1.ETIQUETAS,'CAIXABANK')>0 THEN 'CAIXABANK' 
            WHEN instr(S1.ETIQUETAS,'SABADELL')>0 THEN 'SABADELL' 
            WHEN instr(S1.ETIQUETAS,'BANKINTER')>0 THEN 'BANKINTER' 
            WHEN instr(S1.ETIQUETAS,'CAJAMAR')>0 THEN 'CAJAMAR' 
            WHEN instr(S1.ETIQUETAS,'BNPPARIBAS')>0 THEN 'BNPPARIBAS' 
            WHEN instr(S1.ETIQUETAS,'UNICAJA')>0 THEN 'UNICAJA' 
            WHEN instr(S1.ETIQUETAS,'ABANCA')>0 THEN 'ABANCA' 
            WHEN instr(S1.ETIQUETAS,'IBERCAJA')>0 THEN 'IBERCAJA' 
            WHEN instr(S1.ETIQUETAS,'JPMORGAN')>0 THEN 'JPMORGAN' 
            WHEN instr(S1.ETIQUETAS,'DEUTSCHEBANK')>0 THEN 'DEUTSCHEBANK' 
            WHEN instr(S1.ETIQUETAS,'BANCAMARCH')>0 THEN 'BANCAMARCH' 
            WHEN instr(S1.ETIQUETAS,'LABORALKUTXA')>0 THEN 'LABORALKUTXA' 
            WHEN instr(S1.ETIQUETAS,'SANTANDER')>0 THEN 'SANTANDER' 
            WHEN instr(S1.ETIQUETAS,'KUTXABANK')>0 THEN 'KUTXABANK' 
            WHEN instr(S1.ETIQUETAS,'CREDITAGRICOLE')>0 THEN 'CREDITAGRICOLE' 
            WHEN instr(S1.ETIQUETAS,'BANKIA')>0 THEN 'BANKIA' 
            WHEN instr(S1.ETIQUETAS,'NOVOBANCO')>0 THEN 'NOVOBANCO' 
            WHEN instr(S1.ETIQUETAS,'NOVICAP')>0 THEN 'NOVICAP' 
            WHEN instr(S1.ETIQUETAS,'BANCO COOPERATIVO')>0 THEN 'BANCO COOPERATIVO' 
            WHEN instr(S1.ETIQUETAS,'CAJARURAL NAVARRA')>0 THEN 'CAJARURAL NAVARRA' 
            WHEN instr(S1.ETIQUETAS,'CAIXAPOPULAR')>0 THEN 'CAIXA POPULAR' 
            WHEN instr(S1.ETIQUETAS,'INFORMADO')>0 THEN 'INFORMADO' 
            WHEN instr(S1.ETIQUETAS,'RET.SOLICITADA')>0 THEN 'RET.SOLICITADA' 
            ELSE 'SIN ENTIDAD' 
        END AS ENTIDAD
    FROM DEUDACLI
    LEFT JOIN CLIENTE ON CLIENTE.IDCLIENTE=DEUDACLI.IDCLIENTE
    LEFT JOIN EMPRESA ON DEUDACLI.IDEMPRESA=EMPRESA.IDEMPRESA
    LEFT JOIN FORMA_PAGO ON DEUDACLI.IDFORMA_PAGO=FORMA_PAGO.IDFORMA_PAGO
    LEFT JOIN VENCIMIENTOCLI ON DEUDACLI.IDDEUDACLI=VENCIMIENTOCLI.IDDEUDACLI
    LEFT JOIN LCOBRO ON (LCOBRO.IDVENCIMIENTO=VENCIMIENTOCLI.IDVENCIMIENTOCLI)
    LEFT JOIN (
        SELECT TAG_X_TABLA.ID,
        LISTAGG(TAG.NOMBRE, ', ') WITHIN GROUP (ORDER BY TAG_X_TABLA.IDTAG) AS ETIQUETAS
        FROM TAG_X_TABLA
        LEFT JOIN TAG ON TAG.IDTAG=TAG_X_TABLA.IDTAG
        GROUP BY TAG_X_TABLA.ID, TAG.IDTABLA
        HAVING TAG.IDTABLA=145
    ) S1 ON DEUDACLI.IDDEUDACLI=S1.ID
    WHERE DEUDACLI.ESTADO=1 AND VENCIMIENTOCLI.ESTADO=1
    ORDER BY VENCIMIENTOCLI.FVENCIMIENTO ASC
    """
    try:
        results = execute_query(query)
        return results
    except Exception as e:
        print(f"Error executing query: {e}")
        return None

def get_invoice_details(idfacturacli: int):
    header_query = """
    SELECT 
        f.idfacturacli,
        f.nfactura,
        f.ffactura,
        f.foperacion,
        f.fcontable,
        f.fcobro,
        f.cif as cliente_nif,
        f.nombre as cliente_nombre,
        f.idcliente,
        e.nombre as empresa_nombre,
        d.descripcion as delegacion_nombre,
        sf.descripcioncorta as serie_codigo,
        bp.descripcion as banco_precio_nombre,
        fp.descripcion as forma_pago_nombre,
        cp.descripcion as condicion_pago_nombre,
        caja.descripcion as caja_nombre,
        rf.descripcion as regimen_fiscal_nombre,
        tf.descripcion as tipo_factura_nombre,
        f.estado as estado_fiscal_codigo,
        f.observaciones,
        f.idasiento,
        f.fenvio,
        deudacli.estado as estado_deuda_codigo,
        PKG_FACTURACLI.IMPORTENETOANTESDTOFACTURA(f.idfacturacli) as total_bruto,
        f.dto as dto_porcentaje,
        (PKG_FACTURACLI.IMPORTENETOANTESDTOFACTURA(f.idfacturacli) - PKG_FACTURACLI.IMPORTENETOFACTURA(f.idfacturacli)) as total_descuento,
        PKG_FACTURACLI.IMPORTENETOFACTURA(f.idfacturacli) as total_neto,
        PKG_FACTURACLI.TOTALIMPUESTOSFACTURA(f.idfacturacli) as total_impuestos,
        PKG_FACTURACLI.IMPORTEFACTURA(f.idfacturacli) as total_factura,
        PKG_FACTURACLI.IMPORTERETENCIONGARANTIA(f.idfacturacli) as total_retencion,
        f.porcentaje_garantia,
        f.fgarantia as plazo_garantia,
        tg.descripcion as tipo_garantia_nombre
    FROM FACTURACLI f
    LEFT JOIN SERIE_FACTURACLI sf ON f.idserie_facturacli = sf.idserie_facturacli
    LEFT JOIN EMPRESA e ON sf.idempresa = e.idempresa
    LEFT JOIN DELEGACION d ON f.iddelegacion = d.iddelegacion
    LEFT JOIN BANCO_PRECIO bp ON f.idbanco_precio = bp.idbanco_precio
    LEFT JOIN FORMA_PAGO fp ON f.idforma_pago = fp.idforma_pago
    LEFT JOIN CONDICION_PAGO cp ON f.idcondicion_pago = cp.idcondicion_pago
    LEFT JOIN CAJA caja ON f.idcaja = caja.idcaja
    LEFT JOIN REGIMEN_FISCAL rf ON f.idregimen_fiscal = rf.idregimen_fiscal
    LEFT JOIN TFACTURACLI tf ON f.idtfacturacli = tf.idtfacturacli
    LEFT JOIN DEUDACLI deudacli ON f.iddeuda = deudacli.iddeudacli
    LEFT JOIN V_TGARANTIA_OBRA_CLASIF tg ON f.idtipo_garantia = tg.idtgarantia_obra_clasif
    WHERE f.idfacturacli = :idfacturacli
    """
    lines_query = """
    SELECT 
        lf.idlfacturacli,
        lf.codigo,
        lf.descripcion,
        lf.unidades,
        lf.precio,
        lf.dto,
        lf.dto2,
        lf.importe,
        lf.iva,
        lf.idglfacturacli,
        gl.descripcion as grupo_descripcion,
        gl.orden as grupo_orden,
        CASE 
            WHEN sis.descripcion IS NOT NULL AND sub.descripcion IS NOT NULL 
                THEN sis.descripcion || ' -> ' || sub.descripcion 
            WHEN sub.descripcion IS NOT NULL THEN sub.descripcion 
            WHEN sis.descripcion IS NOT NULL THEN sis.descripcion 
            ELSE NULL 
        END as subsistema
    FROM LFACTURACLI lf
    LEFT JOIN SUBSIS sub ON lf.idsubsis = sub.idsubsis
    LEFT JOIN SISTEMA sis ON lf.idsistema = sis.idsistema
    LEFT JOIN GLFACTURACLI gl ON lf.idglfacturacli = gl.idglfacturacli
    WHERE lf.idfacturacli = :idfacturacli
    ORDER BY NVL(gl.orden, 9999), lf.idglfacturacli, lf.orden, lf.idlfacturacli
    """

    try:
        headers = execute_query(header_query, {"idfacturacli": idfacturacli})
        if not headers:
            return None
        lines = execute_query(lines_query, {"idfacturacli": idfacturacli})
        return {
            "header": headers[0],
            "lines": lines or []
        }
    except Exception as e:
        print(f"Error retrieving invoice details: {e}")
        return None


if __name__ == "__main__":
    report = get_debt_report()
    if report:
        import datetime
        def default(obj):
            if isinstance(obj, (datetime.date, datetime.datetime)):
                return obj.isoformat()
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        print(json.dumps(report, indent=4, ensure_ascii=False, default=default))
    else:
        print("No results found or error occurred.")
