"""
Chat API route for NiveshAI
Gemini-powered conversational assistant for Indian markets.
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai

router = APIRouter()

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """You are NiveshAI, a friendly and expert AI assistant for Indian retail stock market investors.
You specialize in:
- NSE/BSE stocks, indices (Nifty, Sensex, Bank Nifty)
- Signal interpretation (bulk deals, insider trades, technical patterns)
- Indian market regulations (SEBI, IRDAI)
- Technical analysis (RSI, MACD, moving averages, breakouts)
- Fundamental analysis for Indian companies

Rules:
- Always be direct and actionable
- Use Indian market conventions (Nifty, NSE, BSE, crores, lakhs)
- Never give specific buy/sell recommendations, but explain what signals mean
- Format numbers in Indian style (1,50,000 = 1.5 lakh)
- Keep responses concise (max 400 words)
- Use bullet points when listing multiple items"""


class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    """Gemini-powered market chat with conversation history."""
    if not GEMINI_KEY:
        return {
            "reply": "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file to enable AI chat.",
            "model": "fallback"
        }

    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel(
            "gemini-2.5-flash-lite-preview-06-17",
            system_instruction=SYSTEM_PROMPT
        )

        # Build history for multi-turn conversation
        history = []
        if request.history:
            for msg in request.history[-8:]:  # last 8 messages for context
                history.append({
                    "role": msg.role,
                    "parts": [msg.content]
                })

        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(request.message)

        return {
            "reply": response.text,
            "model": "gemini-2.5-flash-lite-preview-06-17"
        }

    except Exception as e:
        print(f"[chat] Gemini error: {e}")
        return {
            "reply": f"I'm having trouble connecting to my AI backend right now. Please try again in a moment. (Error: {str(e)[:100]})",
            "model": "error"
        }
