/**
 * Jesko — AI Chatbot Widget
 * Floating chatbot with glassmorphism design and smart suggestions.
 */
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm JeskoAI 👋 I can help you find cars, book rides, or answer questions. What do you need?",
      suggestions: ['Book a car', 'Become a driver', 'List my car', 'Pricing info'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (isAuthenticated) {
        const { data } = await chatAPI.send({ message: text.trim() });
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: data.reply, suggestions: data.suggestions },
        ]);
      } else {
        // Offline demo mode
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "Please log in to chat with JeskoAI! I can help you with bookings, finding cars, and more once you're signed in.",
            suggestions: ['Login', 'Register'],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again shortly! 🔄" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => sendMessage(text);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-110 btn-press"
        id="chatbot-toggle"
      >
        <MessageCircle size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-900 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] flex flex-col glass-strong rounded-2xl shadow-2xl shadow-brand-500/10 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-brand-600/20 to-brand-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">JeskoAI</p>
            <p className="text-xs text-emerald-400">Online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-brand-400" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-500 text-white rounded-br-md'
                  : 'bg-dark-600 text-gray-200 rounded-bl-md'
              }`}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </div>
              {/* Suggestion chips */}
              {msg.suggestions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestions.map((s, k) => (
                    <button
                      key={k}
                      onClick={() => handleSuggestion(s)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-brand-400" />
            </div>
            <div className="bg-dark-600 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask JeskoAI anything..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-brand-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors btn-press"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
