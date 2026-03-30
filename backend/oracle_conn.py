import oracledb
import json
import os

def clean_encoding(text):
    """Fix common Oracle encoding issues for Spanish characters."""
    if not isinstance(text, str):
        return text
    replacements = {
        "Instalaci¿n": "Instalación", "Instalacion": "Instalación",
        "Revisi¿n": "Revisión", "Revision": "Revisión",
        "Aver¿a": "Avería", "Averia": "Avería",
        "Ejecuci¿n": "Ejecución", "Ejecucion": "Ejecución",
        "Facturaci¿n": "Facturación", "Facturacion": "Facturación",
        "Desviaci¿n": "Desviación", "Desviacion": "Desviación",
        "Producción": "Producción"
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.replace("¿", "ó")
    return text

def get_oracle_connection():
    # Priority: Direct Env Vars (Mandatory)
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "1521")
    service_name = os.getenv("DB_SERVICE_NAME")

    if not all([user, password, host, service_name]):
        missing = [k for k, v in {"DB_USER": user, "DB_PASSWORD": password, "DB_HOST": host, "DB_SERVICE_NAME": service_name}.items() if not v]
        raise EnvironmentError(f"Missing mandatory database environment variables: {', '.join(missing)}")

    dsn = f"{host}:{port}/{service_name}"
    return oracledb.connect(user=user, password=password, dsn=dsn)

def execute_query(query, params=None):
    conn = get_oracle_connection()
    try:
        with conn.cursor() as cursor:
            # Set schema and numeric characters
            cursor.execute("ALTER SESSION SET CURRENT_SCHEMA = SATYA")
            cursor.execute("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,'")
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            if cursor.description:
                columns = [col[0].lower() for col in cursor.description]
                results = []
                for row in cursor.fetchall():
                    processed_row = [clean_encoding(val) if isinstance(val, str) else val for val in row]
                    results.append(dict(zip(columns, processed_row)))
                return results
            return None
    finally:
        conn.close()
