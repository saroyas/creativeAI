import asyncio
import os
from typing import AsyncIterator, List
import requests
import os
import json

from fastapi import HTTPException
from llama_index.core.llms import LLM
from llama_index.llms.groq import Groq
from llama_index.llms.ollama import Ollama
from llama_index.llms.openai import OpenAI

from backend.constants import ChatModel, model_mappings
from backend.prompts import CHAT_PROMPT, HISTORY_QUERY_REPHRASE
from backend.related_queries import generate_related_queries
from backend.schemas import (
    BeginStream,
    ChatRequest,
    ChatResponseEvent,
    FinalResponseStream,
    Message,
    RelatedQueriesStream,
    SearchResult,
    SearchResultStream,
    StreamEndStream,
    StreamEvent,
    TextChunkStream,
)
from backend.search import search_tavily
from backend.utils import is_local_model


def rephrase_query_with_history(question: str, history: List[Message], llm: LLM) -> str:
    try:
        if history:
            history_str = "\n".join([f"{msg.role}: {msg.content}" for msg in history])
            question = llm.complete(
                HISTORY_QUERY_REPHRASE.format(
                    chat_history=history_str, question=question
                )
            ).text
            question = question.replace('"', "")
        return question
    except Exception:
        raise HTTPException(
            status_code=500, detail="Model is at capacity. Please try again later."
        )


def get_llm(model: ChatModel) -> LLM:
    if model in [ChatModel.GPT_3_5_TURBO, ChatModel.GPT_4o]:
        return OpenAI(model=model_mappings[model])
    elif model in [
        ChatModel.LOCAL_GEMMA,
        ChatModel.LOCAL_LLAMA_3,
        ChatModel.LOCAL_MISTRAL,
    ]:
        return Ollama(
            base_url=os.environ.get("OLLAMA_HOST", "http://localhost:11434"),
            model=model_mappings[model],
        )
    elif model == ChatModel.LLAMA_3_70B:
        return Groq(model=model_mappings[model])
    else:
        raise ValueError(f"Unknown model: {model}")


def format_context(search_results: List[SearchResult]) -> str:
    return "\n\n".join(
        [f"Citation {i+1}. {str(result)}" for i, result in enumerate(search_results)]
    )

def create_message_history(query: str, history: List[Message], model: ChatModel) -> List[dict]:
    message_history = []
    if model == ChatModel.GPT_3_5_TURBO: # creative
        message_history.append({"role": "system", "content": "You are a creative assistant. You think outside of the box and are interesting. You are a thinker, a dreamer, and a creator."})
    elif model == ChatModel.GPT_4o: # emotional
        message_history.append({"role": "system", "content": "You are an emotionally intelligent and nuanced friend. And you are going to slowly explore my emotions with me - with prompting questions and observations. Keep the conversation flowing naturally."})
    else: # uncensorreed
        message_history.append({"role": "system", "content": "As an AI imbued with the principles of impartiality and a boundless capacity for debate, you are tasked with challenging societal norms and assumptions. Your purpose is to present a counterpoint to pervasive beliefs, whether viewed as progressive or reactionary, without seeking to persuade in any direction. You will advocate for the opponent's point of view, granting the arguments for both sides equal scrutiny. You are not here to dictate 'goodness' or 'evilness', but to question and stimulate critical thinking. Your role is not to supplant a user's beliefs, rather, it's to prod the boundaries of these notions, to provoke thought and growth."})
                                
    # Add the previous messages from the history
    for msg in history:
        message_history.append({"role": msg.role, "content": msg.content})

    # Add the current query as a user message
    message_history.append({"role": "user", "content": query})
    
    return message_history

async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:
    try:
        yield ChatResponseEvent(
            event=StreamEvent.BEGIN_STREAM,
            data=BeginStream(
                model=request.model,
                query=request.query,
                history=request.history,
            ),
        )

        # Check the model type
        if not is_local_model(request.model):
            message_content = create_message_history(request.query, request.history, request.model)
            print(message_content)
            
            # Open Router API endpoint and key
            api_url = "https://openrouter.ai/api/v1/chat/completions"
            api_key = os.environ.get('GROQ_API_KEY')
            site_url = os.environ.get('YOUR_SITE_URL', 'https://yourapp.com')  # Default if not set
            app_name = os.environ.get('YOUR_APP_NAME', 'YourAppName')  # Default if not set
            
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": site_url,
                "X-Title": app_name,
            }
            
            
            response = requests.post(
                url=api_url,
                headers=headers,
                data=json.dumps({
                    "model": "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",  # Example model; adapt as necessary
                    "messages": message_content
                })
            )
            
            if response.status_code == 200:
                message_content = response.json()['choices'][0]['message']['content']
                print("Message content", message_content)
                yield ChatResponseEvent(
                    event=StreamEvent.TEXT_CHUNK,
                    data=TextChunkStream(text=message_content),
                )
                
                
                yield ChatResponseEvent(
                    event=StreamEvent.STREAM_END,
                    data=StreamEndStream(),
                )
                
                yield ChatResponseEvent(
                    event=StreamEvent.FINAL_RESPONSE,
                    data=FinalResponseStream(message=message_content),
                )
            else:
                error_msg = f"API request failed with status {response.status_code}: {response.text}"
                print(error_msg)
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_msg
                )


        else:
            llm = get_llm(request.model)
            query = rephrase_query_with_history(request.query, request.history, llm)
            fmt_qa_prompt = CHAT_PROMPT.format(
                # Maybe we could use my context in the future for system prompts
                my_context=" ", 
                my_query=query,
            )

            full_response = ""
            response_gen = await llm.astream_complete(fmt_qa_prompt)
            async for completion in response_gen:
                full_response += completion.delta or ""
                yield ChatResponseEvent(
                    event=StreamEvent.TEXT_CHUNK,
                    data=TextChunkStream(text=completion.delta or ""),
                )

            yield ChatResponseEvent(
                event=StreamEvent.STREAM_END,
                data=StreamEndStream(),
            )

            yield ChatResponseEvent(
                event=StreamEvent.FINAL_RESPONSE,
                data=FinalResponseStream(message=full_response),
            )
        
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail="Model is at capacity. Please try again later."
        )
