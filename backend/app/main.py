import time
from collections import defaultdict, deque

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from starlette.responses import JSONResponse

from app.api import router
from app.config import get_settings

settings = get_settings()
app = FastAPI(title="MatchLens API", version="1.0.0", description="Grounded historical cricket replay and assistant API.")
_requests: dict[str, deque[float]] = defaultdict(deque)
_window_seconds = 60
_max_ai_requests = 30

_allowed_origins = list({
    settings.frontend_origin,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
})


@app.middleware("http")
async def protect_api(request: Request, call_next):
    content_length = int(request.headers.get("content-length", "0"))
    if content_length > 256_000:
        return JSONResponse(status_code=413, content={"detail": "Request body is too large"})
    if request.url.path.endswith("/ask") or request.url.path.endswith("/chat") or request.url.path.endswith("/catch-up"):
        key = request.client.host if request.client else "unknown"
        now = time.monotonic()
        bucket = _requests[key]
        while bucket and now - bucket[0] > _window_seconds:
            bucket.popleft()
        if len(bucket) >= _max_ai_requests:
            return JSONResponse(status_code=429, content={"detail": "AI request rate limit exceeded"})
        bucket.append(now)
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception):
    """Return CORS headers even on unhandled 500 errors so the browser doesn't show a CORS failure."""
    origin = request.headers.get("origin", "")
    cors_origin = origin if origin in _allowed_origins else (_allowed_origins[0] if _allowed_origins else "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


app.include_router(router)
