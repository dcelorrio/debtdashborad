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
    # Priority: Env Var > CONTROLOTS sibling > local file
    conexiones_path = os.getenv("ORACLE_CONNECTIONS_PATH")
    
    if not conexiones_path:
        conexiones_path = os.path.join(os.path.dirname(__file__), "..", "..", "CONTROLOTS", "conexiones.json")
        
    if not os.path.exists(conexiones_path):
        conexiones_path = os.path.join(os.path.dirname(__file__), "..", "conexiones.json")
        
    with open(conexiones_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    conn_info = config["conexiones_usadas"][0]
    connection = oracledb.connect(
        user=conn_info["usuario"],
        password=conn_info["password"],
        dsn=f"{conn_info['servidor']}:{conn_info['puerto']}/{conn_info['sid_service']}"
    )
    return connection

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
