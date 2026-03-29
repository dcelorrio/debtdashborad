from oracle_conn import execute_query
import json

def test_cols():
    tables = ['DEUDACLI', 'VENCIMIENTOCLI', 'FACTURACLI']
    for table in tables:
        print(f"--- {table} ---")
        query = f"SELECT * FROM {table} WHERE ROWNUM = 1"
        try:
            results = execute_query(query)
            if results:
                print(json.dumps(list(results[0].keys()), indent=2))
        except Exception as e:
            print(f"Error {table}: {e}")

if __name__ == "__main__":
    test_cols()
