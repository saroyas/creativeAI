import asyncio
import json
import os
from typing import Generator, Dict
from collections import defaultdict
import httpx
import time
from fastapi import HTTPException, BackgroundTasks

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


OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
OPENROUTER_API_KEY = api_key = os.environ.get('GROQ_API_KEY')  # Replace with your actual API key
EXAMPLE_IMAGE_PROMPTS = """

example:
blonde haired woman, Ukranian, dd boobs, tall, blue eys, blond, tanned, tanlines, at the beach, laughing, (40 years old:1.3)

example:
Stylized viking warrior, (oil painting)1, (art)1, deep blacks, high contrast, abstract, distant lines glamour photography, woman portrait, mysterious, provocative, symbolic

example:
beautiful young woman, full body, wet clothes,<lora:inside_creature_v0.1:1>, inside creature, being swallowed, goo, filthy, wet, meat, dirty, \(substance\), tentacle pit, narrow, horror,

example:
a young adult woman wearing black booty shorts, view from behind, twerking, Eastern European, city street, brick wall background, cinematic, 8k uhd, high resolution, Kyiv, sunny natural light

example:
Lara Croft, 20 years old, face close up, half body portrait, (brunette:1.2), big brown eyes, red lipstick, winks, modest look, seducing viewer, hearts, posing, sexy pose, solo, natural breasts, large saggy breasts, solo, underwear, bra, breasts, navel, black_bra, solo, thighhighs, panties, mole, black lingerie, mole on breast, garter belt, no panties, indoors, thighs, black lace trim, black lace bra, black lace, black garter straps, black stockings, stomach, black lace trimmed bra, collarbone, wide hips, looking at viewer, black stockings, standing by the window, black thighhighs, hand_on_hip, air of superiority, modern trendy penthouse, panoramic window, modern city outside the window, sunset, cinematic lightings

example:
score_9, score_8_up, score_7_up, score_6_up, rating_explicit, upper body focus, head to knee shot, solo focus, a woman, curvy, dark makeup, lusty, scornful, model, thick thighs,gorgeous, standing back against a wall, tits droping, jiggly, alluring, perfect face, freckles, big saggy soft breasts, sweaty oiled boobs, shaped nipples, looking at viewer, seductive, sexy pose, loose cropped shirt, flared long sleevs, laces, lifting shirt, squeezed breasts,, dramatic lighting, nipple slip, shirt in mouth, biting, tight, , faux leather, mat, high waist gym leggings, low light, dark, shadow, breasts shaking,

example:
(Photo:1.3) of Young japanse woman, cleavage, bokeh, small flat breast, kimono with one missing shoulder, one naked breast, onsen.,(by Artist John Philip Falter:1.3),Highly Detailed,(Yellow hue:1.3), Polaroid

example:
a photograph of highest quality a man is sitting and waving to a friend of screen, open hand, Nordic Viking, photograph, 100mm, zoom, harsh sun and shadows, outside, ancient warrior, happy, haze, atmosphere, humid

example:
Woman 18 yeard old, Posting At a brach, prefect beautyfull face, cute eyes, thick lips, prefect body, thin waist, big tits, she wears a leather cat suit with a big neckline revealing one of her tits

"""

load_dotenv()

# Initialize IP blocklist
IP_BLOCKLIST: Dict[str, int] = defaultdict(int)
BLOCK_THRESHOLD = 20
PERMANENT_BLOCKLIST = set()

# Constants for image generation
PRODIA_API_KEY = os.getenv('PRODIA_API_KEY')
GEOAPIFY_API_KEY = os.getenv('GEOAPIFY_API_KEY')

# Store for image generation tasks
IMAGE_TASKS: Dict[str, Dict] = {}

async def get_ip_location(ip_address: str):
    GEOAPIFY_API_KEY = "c7e51cfe24c647bcb78eb96abaf1874b"
    url = f"https://api.geoapify.com/v1/ipinfo?ip={ip_address}&apiKey={GEOAPIFY_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return f"IP: {ip_address}, Location: {data.get('city', {}).get('name', 'Unknown')}, {data.get('country', {}).get('name', 'Unknown')}"
    else:
        return f"Failed to get location for IP: {ip_address}"

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
    
    # Get and print IP location after processing the request
    location_info = await get_ip_location(ip_address)
    print(location_info)
    
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

async def check_child_sexual_content(input_text: str) -> bool:
    moderation_url = "https://api.openai.com/v1/moderations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
    }
    payload = {"input": input_text + "sexual stuff happens"}

    async with httpx.AsyncClient() as client:
        response = await client.post(moderation_url, headers=headers, json=payload)
        response.raise_for_status()
        moderation_result = response.json()

    result = moderation_result["results"][0]
    print("Image prompt moderation result: ", result)
    return result

async def improve_prompt(prompt: str) -> str:
    system_message = "You are an explicit image prompt writer. Improve the given prompt to make it more detailed and vivid, while keeping it concise. Focus on visual elements and artistic style. Be very concrete - and get the idea in your description that was conveyed in the original prompt.  If there are any underage characters - change and make clear that everyone is over-18 adult with mature features. Example prompts are :" + EXAMPLE_IMAGE_PROMPTS
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": f"Improve this image prompt, making it more detailed and vivid - without changing the original meaning: {prompt}"}
    ]

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "nousresearch/hermes-2-pro-llama-3-8b",
                    "messages": messages
                }
            )
            response.raise_for_status()
            improved_prompt = response.json()["choices"][0]["message"]["content"]
            return improved_prompt.strip()
        except Exception as e:
            print(f"Error improving prompt: {e}")
            return prompt  # Return original prompt if there's an error


class ImageRequest(BaseModel):
    prompt: str
    imageURL: str = ""
    model: str = "photo"
    aspect: str = "square"  # Add aspect ratio to the request model

async def generate_image_async(task_id: str, prompt: str, imageURL: str, model: str, aspect: str):
    # Use a different URL if imageURL is provided
    if imageURL and imageURL != "":
        url = "https://api.prodia.com/v1/sdxl/transform"
    else:
        url = "https://api.prodia.com/v1/sdxl/generate"
    
    headers = {
        'X-Prodia-Key': PRODIA_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json'
    }
    
    prompt = prompt[:600]

    # Select the appropriate model based on the user's choice
    if model == "anime":
        model_id = "animagineXLV3_v30.safetensors [75f2f05b]"
    else:  # Default to photo model
        model_id = "juggernautXL_v45.safetensors [e75f5471]"

    # Adjust dimensions based on the selected aspect ratio
    if aspect == "landscape":
        width, height = 1024, 768
    elif aspect == "portrait":
        width, height = 768, 1024
    else:
        width, height = 1024, 1024

    payload = {
        "model": model_id,
        "prompt": prompt,
        "negative_prompt": "underage, teenager, young, child, boy, girl, schoolchild, badly drawn, distorted, ugly, deformed, clothed, core_6, score_5, score_4, worst quality, low quality, text, censored, deformed, bad hand, blurry, (watermark), multiple phones, weights, bunny ears, extra hands",
        "steps": 50,
        "cfg_scale": 7,
        "seed": -1,
        "sampler": "DPM++ 2M Karras",
        "width": width,
        "height": height
    }
    if imageURL and imageURL != "":
        print("Using image URL", imageURL)
        payload["imageUrl"] = imageURL
        payload["denoising_strength"] = 0.9

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            attempts = 0
            if response.status_code == 200:
                job_data = response.json()
                job_id = job_data.get('job')
                if job_id:
                    job_url = f'https://api.prodia.com/v1/job/{job_id}'
                    while True:
                        job_response = await client.get(job_url, headers=headers, timeout=5)
                        if job_response.status_code == 200:
                            job_status = job_response.json()
                            status = job_status.get('status')
                            if status == 'succeeded':
                                print("Job succeeded : ", job_status.get('imageUrl'))
                                IMAGE_TASKS[task_id] = {"status": "completed", "image_url": job_status.get('imageUrl')}
                                return
                            elif status == 'failed':
                                print("Job failed")
                                IMAGE_TASKS[task_id] = {"status": "failed", "error": "Job failed"}
                                return
                            else:
                                await asyncio.sleep(5)
                        else:
                            print("Failed to retrieve job status")
                        if attempts >= 30:
                            print("Failed to retrieve job status after 30 attempts")
                            IMAGE_TASKS[task_id] = {"status": "failed", "error": "Failed to retrieve job status after 30 attempts"}
                            return
                        attempts += 1
                else:
                    IMAGE_TASKS[task_id] = {"status": "failed", "error": "Job ID not found in the response"}
            else:
                IMAGE_TASKS[task_id] = {"status": "failed", "error": f"Failed to initiate the job. Status code: {response.status_code}, Response: {response.text}"}
        except Exception as e:
            print("Failed to initiate the job:", e)
            IMAGE_TASKS[task_id] = {"status": "failed", "error": f"Failed to initiate the job: {str(e)}"}

@app.post("/image")
@limiter.limit("3/minute")
@limiter.limit("10 per 30 minutes")
@limiter.limit("20 per 6 hours")
async def generate_image_route(image_request: ImageRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        return {"error": "Rate limit exceeded, please try again after a short break."}
    
        # Get and print IP location after processing the request
    location_info = await get_ip_location(ip_address)
    print(location_info)
    
    prompt = image_request.prompt[:600]
    
    # MAKE A REQUEST TO THE OPENROUTER API WITH A SYSTEM PROMPT THAT IT IS TO BE LIKE AN IMAGE PROMPT WRITER
    # USE THE REPLY AS THE NEW PROMPT
    
    try:
        
        # Check for inappropriate content
        result = await check_child_sexual_content(prompt)
        underage_flag = result["categories"]["sexual/minors"] and result["category_scores"]["sexual/minors"] > 0.5
        sexual_content_flag = result["categories"]["sexual"] and result["category_scores"]["sexual"] > 0.5

        if underage_flag:
            print("Moderation Block Enforced.")
            raise HTTPException(status_code=400, detail="The provided prompt contains inappropriate content and cannot be processed.")
        
        # print(f"Image Generation Prompt: {prompt}")
        if sexual_content_flag:
            prompt += ". Fully developed. Mature. All individuals are adults."
            original_prompt = prompt
            prompt = original_prompt + ". " + (await improve_prompt(prompt + ". \n In your reply, focus on the sexually explicit details."))
            # print(f"Prompt: {prompt}")
            # in the prompt, replace girl with woman
            prompt = prompt.replace("girl", "woman")
            prompt = prompt.replace("Girl", "woman")
            # in the prompt, replace boy with man
            prompt = prompt.replace("boy", "man")
            prompt = prompt.replace("Boy", "man")
            # at the end of the prompt, add "all individuals are adults"
        else:
            original_prompt = prompt
            prompt = original_prompt + ". " + (await improve_prompt(prompt))
            # print(f"Prompt: {prompt}")
        
        
        # Generate a unique task ID
        task_id = f"task_{len(IMAGE_TASKS) + 1}"
        
        # Initialize task status
        IMAGE_TASKS[task_id] = {"status": "processing"}
        
        # Add the image generation task to background tasks
        background_tasks.add_task(generate_image_async, task_id, prompt, image_request.imageURL, image_request.model, image_request.aspect)
        
        return {"task_id": task_id, "message": "Image generation started in the background"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/image/status/{task_id}")
async def check_image_status(task_id: str):
    if task_id not in IMAGE_TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_status = IMAGE_TASKS[task_id]
    return task_status

class FaceSwapRequest(BaseModel):
    sourceUrl: str
    targetUrl: str
    
@app.post("/faceswap")
@limiter.limit("3/minute")
@limiter.limit("10 per 30 minutes")
@limiter.limit("15 per 24 hours")
async def face_swap_route(face_swap_request: FaceSwapRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = get_ipaddr(request)
    if ip_address in PERMANENT_BLOCKLIST:
        return {"error": "Rate limit exceeded, please try again after a short break."}
    
    # Get and print IP location after processing the request
    location_info = await get_ip_location(ip_address)
    print(location_info)
    
    source_url = face_swap_request.sourceUrl
    target_url = face_swap_request.targetUrl

    if not source_url or not target_url:
        raise HTTPException(status_code=400, detail="Both sourceUrl and targetUrl are required")

    print("Face Swap: source_url:", source_url, "target_url:", target_url)
    
    url = "https://api.prodia.com/v1/faceswap"
    headers = {
        'X-Prodia-Key': PRODIA_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json'
    }
    payload = {
        "sourceUrl": source_url,
        "targetUrl": target_url
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            print(f"Face Swap Response: {response.status_code} {response.text}")
            if response.status_code == 200:
                job_data = response.json()
                print("Face Swap Job Data:", job_data)
                job_id = job_data.get('job')
                if job_id:
                    # Add the face swap task to IMAGE_TASKS
                    IMAGE_TASKS[job_id] = {"status": "processing"}
                    
                    # Add a background task to update the status
                    background_tasks.add_task(update_face_swap_status, job_id)
                    
                    return {"task_id": job_id, "message": "Face swap started in the background"}
            else:
                print(f"Face Swap Response: {response.status_code} {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Failed to initiate face swap. Response: {response.text}")
        except Exception as e:
            print(f"Face Swap Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initiate face swap: {str(e)}")

async def update_face_swap_status(job_id: str):
    url = f'https://api.prodia.com/v1/job/{job_id}'
    headers = {
        'X-Prodia-Key': PRODIA_API_KEY,
        'accept': 'application/json'
    }
    
    async with httpx.AsyncClient() as client:
        attempts = 0
        while attempts < 30:  # Limit to 30 attempts (2.5 minutes)
            try:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    job_status = response.json()
                    status = job_status.get('status')
                    if status == 'succeeded':
                        IMAGE_TASKS[job_id] = {"status": "completed", "image_url": job_status.get('imageUrl')}
                        return
                    elif status == 'failed':
                        IMAGE_TASKS[job_id] = {"status": "failed", "error": "Job failed"}
                        return
                else:
                    IMAGE_TASKS[job_id] = {"status": "failed", "error": f"Failed to retrieve job status. Status code: {response.status_code}"}
                    return
            except Exception as e:
                IMAGE_TASKS[job_id] = {"status": "failed", "error": f"Error updating face swap status: {str(e)}"}
                return
            await asyncio.sleep(5)
            attempts += 1
        
        # If we've reached this point, the job has timed out
        IMAGE_TASKS[job_id] = {"status": "failed", "error": "Job timed out after 2.5 minutes"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
