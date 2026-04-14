"""
Jesko — Gemini AI Chatbot Router
Integrates Google Gemini API for booking assistance, FAQs, and car recommendations.
"""
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from app.config import settings
from app.schemas.schemas import ChatMessage, ChatResponse
from app.middleware.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

SYSTEM_PROMPT = """You are JeskoAI, the intelligent assistant for Jesko — an AI-powered car rental 
and driver marketplace. You help users with:
- Finding the right car based on their needs (budget, location, category)
- Understanding booking options: Self-Drive, Driver-Assisted, Emergency Driver
- Answering FAQs about pricing, cancellation, safety, and trust scores
- Guiding owners on how to list cars and earn passive income
- Helping drivers understand how to register, accept bookings, and track earnings

Platform facts:
- Platform commission: 10% per booking
- Driver fee: ₹800/day
- Booking modes: Self-Drive, Driver-Assisted, Emergency
- Trust Score: based on reviews and booking history
- Car categories: sedan, SUV, hatchback, luxury

Be concise, friendly, and professional. Always recommend the best option for the user's situation."""


def _get_model():
    if not settings.gemini_api_key:
        return None
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )


@router.post("/", response_model=ChatResponse)
async def chat(
    payload: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    """Send a message to JeskoAI chatbot."""
    model = _get_model()

    if not model:
        # Demo mode — no API key configured
        return _demo_reply(payload.message)

    try:
        context_str = ""
        if payload.context:
            context_str = f"\n\nUser context: {payload.context}"

        response = model.generate_content(payload.message + context_str)
        reply = response.text.strip()

        suggestions = _generate_suggestions(payload.message)
        return ChatResponse(reply=reply, suggestions=suggestions)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


def _demo_reply(message: str) -> ChatResponse:
    """Fallback responses when Gemini API key is not configured."""
    msg = message.lower()
    if any(w in msg for w in ["book", "rent", "car"]):
        reply = ("I'd love to help you book a car! 🚗\n\n"
                 "We have 3 booking modes:\n"
                 "• **Self-Drive** — You drive yourself\n"
                 "• **Driver-Assisted** — We assign a professional driver (₹800/day)\n"
                 "• **Emergency** — On-demand driver within 30 minutes\n\n"
                 "What's your preferred pickup location and budget?")
    elif any(w in msg for w in ["driver", "earn", "job"]):
        reply = ("Become a Jesko driver and earn flexibly! 🧑‍✈️\n\n"
                 "• Set your own availability\n"
                 "• Accept/reject bookings freely\n"
                 "• Earn ₹800+/day per assignment\n"
                 "• Build your Trust Score for more bookings\n\n"
                 "Ready to register? Go to Driver → Register in the menu.")
    elif any(w in msg for w in ["owner", "list", "passive", "income"]):
        reply = ("Turn your idle car into income! 💰\n\n"
                 "• List your car in 2 minutes\n"
                 "• Set your own daily price\n"
                 "• Earn 80% of every booking\n"
                 "• Full real-time tracking dashboard\n\n"
                 "Go to Owner Dashboard → Add Car to get started.")
    elif any(w in msg for w in ["price", "cost", "fee", "commission"]):
        reply = ("Here's Jesko's transparent pricing 💳\n\n"
                 "• Car rental: set by owner\n"
                 "• Platform fee: 10% per booking\n"
                 "• Driver fee: ₹800/day (if driver-assisted)\n"
                 "• Owner earns: 80% of base rental\n"
                 "• No hidden charges!")
    else:
        reply = ("Hi! I'm JeskoAI 👋 I can help you with:\n\n"
                 "• 🚗 Finding the perfect car\n"
                 "• 📅 Booking assistance\n"
                 "• 🧑‍✈️ Driver registration\n"
                 "• 💰 Owner listings\n"
                 "• ❓ FAQs & support\n\n"
                 "What can I help you with today?")

    return ChatResponse(reply=reply, suggestions=_generate_suggestions(message))


def _generate_suggestions(message: str):
    """Smart follow-up suggestions based on user message."""
    msg = message.lower()
    if "book" in msg or "car" in msg:
        return ["Show available cars", "What's the driver fee?", "How do I cancel?"]
    elif "driver" in msg or "earn" in msg:
        return ["How to register as driver?", "What is driver score?", "Driver payout details"]
    elif "owner" in msg or "list" in msg:
        return ["How to add my car?", "How much will I earn?", "Owner dashboard tour"]
    return ["Book a car", "Become a driver", "List my car", "Talk to support"]
