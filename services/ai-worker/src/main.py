from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Floriven AI Worker",
    version="0.0.1",
    docs_url="/docs",
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})
