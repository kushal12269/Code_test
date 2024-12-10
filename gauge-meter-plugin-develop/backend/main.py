import os
from starlette.middleware.cors import CORSMiddleware
from dataclasses import dataclass, field
from typing import Optional
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from scripts.config import Service
from scripts.core.services.dashboard import router
from scripts.core.services.defaults import router as default


@dataclass
class FastAPIConfig:
    title: str = "Visualization Service"
    description: str = "Lambweston Dashboards"
    docs_url: str = os.environ.get("SW_DOCS_URL")
    redoc_url: str = field(default=None)
    openapi_url: Optional[str] = os.environ.get("SW_OPENAPI_URL")


SECURE_ACCESS = True if os.environ.get("SECURE_ACCESS") in {"true", "True", True} else False
app = FastAPI(**FastAPIConfig().__dict__)
app.include_router(router)
app.include_router(default)
app.mount("/assets", StaticFiles(directory=f"{Service.BUILD_DIR}/assets"), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PUT"],
    allow_headers=["*"],
)

@app.get("/visualization/healthcheck")
async def ping():
    return {"status": 200}
