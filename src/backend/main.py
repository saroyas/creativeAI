import asyncio
import json
import os
from typing import Generator

import logfire
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_ipaddr
from slowapi.extension import Limiter as SlowapiLimiter
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from backend.chat import stream_qa_objects
from backend.schemas import ChatRequest, ChatResponseEvent, ErrorStream
from backend.utils import strtobool
from backend.validators import validate_model

load_dotenv()

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
    try:
        body = await request.json()
    except:
        body = "No JSON body"
    print(f"Rate limit exceeded for IP: {ip_address}, Query: {body}")
    
    def generator():
        yield create_error_event("Rate limit exceeded, please try again after a short break.")
    
    return EventSourceResponse(
        generator(),
        media_type="text/event-stream",
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
        app, strtobool(os.getenv("RATE_LIMIT_ENABLED", True))
    )
    return app

app = create_app()
limiter = app.state.limiter

@app.post("/chat")
@limiter.limit("4/minute")
@limiter.limit("40 per 2 hours")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
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
