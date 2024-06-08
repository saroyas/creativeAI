import asyncio
import json
import os
from typing import Generator, Dict
from collections import defaultdict

import logfire
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_ipaddr
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from backend.chat import stream_qa_objects
from backend.schemas import ChatRequest, ChatResponseEvent, ErrorStream
from backend.utils import strtobool
from backend.validators import validate_model

load_dotenv()

# Initialize IP blocklist
IP_BLOCKLIST: Dict[str, int] = defaultdict(int)
BLOCK_THRESHOLD = 10
PERMANENT_BLOCKLIST = set()

def create_error_event(detail: str):
    obj = ChatResponseEvent(
        data=ErrorStream(detail=detail),
        event="error",
    )
    return ServerSentEvent(
        data=json.dumps(jsonable_encoder(obj)),
        event="error",
    )

def configure_logging(app: FastAPI, logfire_token: str):
    if logfire_token:
        logfire.configure()
        logfire.instrument_fastapi(app)

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    ip_address = get_ipaddr(request)
    IP_BLOCKLIST[ip_address] += 1
    if IP_BLOCKLIST[ip_address] >= BLOCK_THRESHOLD:
        # Add to permanent blocklist
        PERMANENT_BLOCKLIST.add(ip_address)
        print(f"BLOCKING: Adding {ip_address} to permanent blocklist")
    
    async def generator():
        yield create_error_event("Rate limit exceeded, please try again after a short break. Alternatively, try https://openrouter.ai/")
    
    return EventSourceResponse(
        generator(),
        media_type="text/event-stream",
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,  # Set the status code to 429
    )

def configure_rate_limiting(app: FastAPI, rate_limit_enabled: bool):
    limiter = Limiter(
        key_func=get_ipaddr,
        enabled=rate_limit_enabled,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

def configure_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://www.aiuncensored.info"],  # Update this to your frontend URL
        allow_credentials=True,
        allow_methods=["*"],  # You can restrict this to specific methods if needed
        allow_headers=["*"],  # You can restrict this to specific headers if needed
    )

def create_app() -> FastAPI:
    app = FastAPI()
    configure_middleware(app)
    configure_logging(app, os.getenv("LOGFIRE_TOKEN"))
    configure_rate_limiting(
        app, strtobool(os.getenv("RATE_LIMIT_ENABLED", "True"))
    )
    return app

app = create_app()
limiter = app.state.limiter

@app.post("/chat")
@limiter.limit("5/minute")
@limiter.limit("30/hour")
@limiter.limit("80 per 10 hours")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        # Block the request if the IP is in the permanent blocklist
        async def blocked_generator():
            yield create_error_event("Your IP has been permanently blocked due to excessive requests.")
        return EventSourceResponse(
            blocked_generator(),
            media_type="text/event-stream",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    
    async def generator():
        try:
            validate_model(chat_request.model)
            async for obj in stream_qa_objects(chat_request):
                if await request.is_disconnected():
                    break
                yield json.dumps(jsonable_encoder(obj))
                await asyncio.sleep(0)
        except Exception as e:
            yield create_error_event(str(e))
            await asyncio.sleep(0)
            return

    return EventSourceResponse(generator(), media_type="text/event-stream")

# IP Blocking Middleware
@app.middleware("http")
async def block_ip_middleware(request: Request, call_next):
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        print(f"BLOCKING: {ip_address} is in permanent blocklist")
        async def blocked_generator():
            yield create_error_event("Your IP has been permanently blocked due to excessive requests.")
        return EventSourceResponse(
            blocked_generator(),
            media_type="text/event-stream",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    response = await call_next(request)
    return response
