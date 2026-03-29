from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from get_debt_data import get_debt_report
import uvicorn

app = FastAPI(title="Debt Dashboard API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Debt Dashboard API is running"}

@app.get("/api/debt-report")
def debt_report():
    data = get_debt_report()
    if data is None:
        raise HTTPException(status_code=500, detail="Error retrieving data from Oracle")
    return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
