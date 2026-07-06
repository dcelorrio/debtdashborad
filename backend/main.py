from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from pydantic import BaseModel
from get_debt_data import get_debt_report, get_invoice_details
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

# Configuración de SSO
SECRET_KEY = os.environ.get("SECRET_KEY", "SUPER_SECRET_KEY_CHANGE_THIS").strip()
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

ALLOWED_GROUPS = {"APP_DEUDA_ADMIN", "APP_DEUDA_USER"}

class User(BaseModel):
    username: str
    groups: list[str] = []

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        groups: list[str] = payload.get("groups", [])
        if username is None:
            raise credentials_exception
        
        # Validar si tiene al menos uno de los grupos permitidos
        user_groups_set = set(groups)
        if not ALLOWED_GROUPS.intersection(user_groups_set):
            raise HTTPException(
                status_code=403,
                detail="No tienes los permisos necesarios para acceder a esta aplicación."
            )
            
        return User(username=username, groups=groups)
    except JWTError:
        raise credentials_exception

@app.get("/")
def read_root():
    return {"message": "Debt Dashboard API is running"}

@app.get("/api/debt-report")
def debt_report(current_user: User = Depends(get_current_user)):
    data = get_debt_report()
    if data is None:
        raise HTTPException(status_code=500, detail="Error retrieving data from Oracle")
    return data

@app.get("/api/invoice/{idfacturacli}")
def invoice_details(idfacturacli: int, current_user: User = Depends(get_current_user)):
    data = get_invoice_details(idfacturacli)
    if data is None:
        raise HTTPException(status_code=404, detail="Invoice not found or database error")
    return data


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
