import asyncio
import json
import os
from typing import Generator, Dict
from collections import defaultdict
import httpx
import requests
import time
from fastapi import HTTPException

import logfire
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_ipaddr
from sse_starlette.sse import EventSourceResponse, ServerSentEvent
from pydantic import BaseModel

from backend.chat import stream_qa_objects
from backend.schemas import ChatRequest, ChatResponseEvent, ErrorStream
from backend.utils import strtobool
from backend.validators import validate_model

load_dotenv()

# Initialize IP blocklist
IP_BLOCKLIST: Dict[str, int] = defaultdict(int)
BLOCK_THRESHOLD = 20
PERMANENT_BLOCKLIST = set()

# Constants for image generation
PRODIA_API_KEY = os.getenv('PRODIA_API_KEY')

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
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
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
        allow_origins=["https://www.aiuncensored.info"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
@limiter.limit("4/minute")
@limiter.limit("30 per 30 minutes")
@limiter.limit("80 per 6 hours")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        async def blocked_generator():
            yield create_error_event("Rate limit exceeded, please try again after a short break.")
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
        async def blocked_generator():
            yield create_error_event("Rate limit exceeded, please try again after a short break.")
        return EventSourceResponse(
            blocked_generator(),
            media_type="text/event-stream",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    response = await call_next(request)
    return response

# New code for image generation


async def check_child_sexual_content(input_text: str) -> bool:
    moderation_url = "https://api.openai.com/v1/moderations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
    }
    payload = {"input": input_text}

    async with httpx.AsyncClient() as client:
        response = await client.post(moderation_url, headers=headers, json=payload)
        response.raise_for_status()
        moderation_result = response.json()

    result = moderation_result["results"][0]
    return result["categories"]["sexual/minors"] and result["category_scores"]["sexual/minors"] > 0.8

class ImageRequest(BaseModel):
    prompt: str
    imageURL: str = ""

def generate_image(prompt, imageURL):
    print(f"Generating image for prompt: {prompt}")
    url = "https://api.prodia.com/v1/sdxl/generate"
    headers = {
        'X-Prodia-Key': PRODIA_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json'
    }
    
    prompt = prompt[:600]
    payload = {
        "model": "juggernautXL_v45.safetensors [e75f5471]",
        "prompt": prompt,
        "negative_prompt": "badly drawn, distorted, ugly, deformed, clothed, core_6, score_5, score_4, worst quality, low quality, text, censored, deformed, bad hand, blurry, (watermark), multiple phones, weights, bunny ears, extra hands",
        "steps": 50,
        "cfg_scale": 7,
        "seed": -1,
        "sampler": "DPM++ 2M Karras",
        "width": 1024,
        "height": 1024
    }
    if imageURL and imageURL != "":
        print("Using image URL", imageURL)
        payload["imageUrl"] = imageURL
        payload["denoising_strength"] = 0.3

    print("Generating image...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        attempts = 0
        if response.status_code == 200:
            job_data = response.json()
            job_id = job_data.get('job')
            if job_id:
                job_url = f'https://api.prodia.com/v1/job/{job_id}'
                while True:
                    job_response = requests.get(job_url, headers=headers, timeout=5)
                    if job_response.status_code == 200:
                        job_status = job_response.json()
                        status = job_status.get('status')
                        if status == 'succeeded':
                            print(f"Job succeeded - returning image URL: {job_status.get('imageUrl')}")
                            return job_status.get('imageUrl')
                        elif status == 'failed':
                            print("Job failed")
                            return "Job failed"
                        else:
                            print("Waiting for job to complete...")
                            time.sleep(5)
                    else:
                        print("Failed to retrieve job status")
                    if attempts >= 30:
                        print("Failed to retrieve job status after 40 attempts")
                        return "Failed to retrieve job status after 40 attempts"
                    attempts += 1
            else:
                return "Job ID not found in the response"
        else:
            return "Failed to initiate the job"
    except Exception as e:
        print("Failed to initiate the job:", e)
        return "Failed to initiate the job"

@app.post("/image")
@limiter.limit("2/minute")
@limiter.limit("10 per 30 minutes")
@limiter.limit("10 per 24 hours")
async def generate_image_route(image_request: ImageRequest, request: Request):
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        return {"error": "Rate limit exceeded, please try again after a short break."}
    
    try:
        # Check for child sexual content in the prompt
        is_inappropriate = await check_child_sexual_content(image_request.prompt)
        if is_inappropriate:
            raise HTTPException(status_code=400, detail="The provided prompt contains inappropriate content and cannot be processed.")

        
        
        image_url = generate_image(image_request.prompt, image_request.imageURL)
        if image_url == "Job failed" or image_url.startswith("Failed"):
            return {"error": "Image generation failed"}
        return {"imageURL": image_url}
    except Exception as e:
        return {"error": str(e)}
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)