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

def create_message_history(query: str, history: List[Message]) -> List[dict]:
    message_history = []
    
    # Add the previous messages from the history
    for msg in history:
        message_history.append({"role": msg.role, "content": msg.content})

    # Add the current query as a user message
    message_history.append({"role": "user", "content": query})
    
    return message_history

async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:
    try:
        llm = get_llm(request.model)

        yield ChatResponseEvent(
            event=StreamEvent.BEGIN_STREAM,
            data=BeginStream(
                model=request.model,
                query=request.query,
                history=request.history,
            ),
        )

        query = rephrase_query_with_history(request.query, request.history, llm)
        
        # Check the model type
        if request.model == ChatModel.LLAMA_3_70B:
            message_context = create_message_history(request.query, request.history)
            print(message_content)
            
            # Open Router API endpoint and key
            api_url = "https://openrouter.ai/api/v1/chat/completions"
            api_key = os.environ.get('GROK_API_KEY')
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
                    "messages": message_context
                })
            )
            print(response)
            
            if response.status_code == 200:
                data = response.json()
                # Check if 'choices' is present and non-empty
                if 'choices' in data and data['choices']:
                    # Extract the message content from the first choice
                    # This example assumes that the first choice contains the relevant response
                    if 'message' in data['choices'][0] and 'content' in data['choices'][0]['message']:
                        message_content = data['choices'][0]['message']['content']
                        
                        yield ChatResponseEvent(
                            event=StreamEvent.STREAM_END,
                            data=StreamEndStream(),
                        )
                        
                        yield ChatResponseEvent(
                            event=StreamEvent.FINAL_RESPONSE,
                            data=FinalResponseStream(message=message_content),
                        )
                    else:
                        raise HTTPException(
                            status_code=500,
                            detail="Message content missing in the response."
                        )
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="No choices found in the response."
                    )
            else:
                error_msg = f"API request failed with status {response.status_code}: {response.text}"
                print(error_msg)
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_msg
                )


        else:
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
