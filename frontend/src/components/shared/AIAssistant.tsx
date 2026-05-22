/**
 * src/components/shared/AIAssistant.tsx
 *
 * AI Shopping Assistant — floating button + slide-up panel.
 *
 * ─────────────────────────────────────────────────────────────
 * Architecture: Local component state only
 * ─────────────────────────────────────────────────────────────
 * open          → panel visibility toggle
 * query         → controlled input value
 * loading       → fetch in progress
 * error         → error message string
 * result        → { message, products } from backend
 * history       → array of past Q&A turns in this session
 *
 * No Redux slice needed — this is a self-contained UI widget.
 *
 * ─────────────────────────────────────────────────────────────
 * UI Design Philosophy
 * ─────────────────────────────────────────────────────────────
 * Matches the Flipkart ecosystem: white panels, #2874f0 blue
 * accents, compact spacing, dense typography. NOT a dark chatbot.
 *
 * Mobile: panel becomes full-width bottom sheet.
 * Desktop: fixed 420px panel in the bottom-right corner.
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { Star } from 'lucide-react';
import { aiApi, AIRecommendResponse } from '../../api/aiApi';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Product } from '../../types/api.types';

// ── Quick suggestion chips ──────────────────────────────────────
const SUGGESTIONS = [
  'Best phones under ₹20k',
  'Gaming laptops under ₹60k',
  'Wireless headphones',
  'Running shoes under ₹3k',
  'Smartwatch under ₹10k',
];

// ── Session history entry ───────────────────────────────────────
interface HistoryEntry {
  query: string;
  result: AIRecommendResponse;
}

// ── Compact product card for the assistant panel ────────────────
// Reuses Product type but renders a horizontal compact card
// (not the full ProductCard — too large for the panel width)
const AssistantProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const discountPct = product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <button
      onClick={() => navigate(`/products/${product.id}`)}
      className="w-full flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-sm hover:border-[#2874f0] hover:shadow-sm transition-all text-left group"
      aria-label={`View ${product.name}`}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-14 bg-gray-50 rounded-sm overflow-hidden flex items-center justify-center border border-gray-100">
        <img
          src={product.imageUrls[0] || 'https://via.placeholder.com/56x56'}
          alt={product.name}
          className="max-w-full max-h-full object-contain p-1"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#212121] line-clamp-2 leading-tight mb-1 group-hover:text-[#2874f0]">
          {product.name}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rating badge */}
          <span className="inline-flex items-center bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm gap-0.5">
            {Number(product.rating).toFixed(1)}
            <Star className="w-2 h-2 fill-current" />
          </span>
          {/* Price */}
          <span className="text-[13px] font-semibold text-[#212121]">
            {formatCurrency(product.discountPrice)}
          </span>
          {discountPct > 0 && (
            <span className="text-[11px] text-[#388e3c] font-medium">{discountPct}% off</span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2874f0] flex-shrink-0" />
    </button>
  );
};

// ── Skeleton loader for product cards ──────────────────────────
const ProductCardSkeleton = () => (
  <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-sm animate-pulse">
    <div className="w-14 h-14 bg-gray-200 rounded-sm flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// ── Main AI Assistant component ────────────────────────────────
export const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AIRecommendResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll results into view after new result
  useEffect(() => {
    if (currentResult) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [currentResult]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (queryText?: string) => {
    const q = (queryText ?? query).trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setCurrentResult(null);
    setCurrentQuery(q);
    setQuery('');

    try {
      const result = await aiApi.recommend(q);
      setCurrentResult(result);
      // Push to session history
      setHistory((prev) => [...prev, { query: q, result }]);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSubmit(suggestion);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewSearch = () => {
    setCurrentResult(null);
    setCurrentQuery('');
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* ── Floating Trigger Button ──────────────────────────── */}
      <button
        id="ai-assistant-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Shopping Assistant"
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center gap-2
          bg-[#2874f0] hover:bg-[#1a65d6]
          text-white
          pl-4 pr-5 py-3
          rounded-full
          shadow-[0_4px_20px_rgba(40,116,240,0.45)]
          hover:shadow-[0_6px_24px_rgba(40,116,240,0.55)]
          transition-all duration-200
          text-sm font-medium
          ${open ? 'scale-95 opacity-75' : 'scale-100 opacity-100'}
        `}
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>

      {/* ── Backdrop (mobile only) ───────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── Assistant Panel ──────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="AI Shopping Assistant"
        aria-modal="true"
        className={`
          fixed z-50
          bg-white
          shadow-[0_8px_40px_rgba(0,0,0,0.18)]
          border border-gray-200
          flex flex-col
          transition-all duration-300 ease-out
          
          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]
          
          /* Desktop: bottom-right panel */
          sm:bottom-20 sm:right-6 sm:left-auto
          sm:w-[420px] sm:max-h-[600px]
          sm:rounded-lg
          
          ${open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#2874f0] rounded-t-2xl sm:rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">AI Shopping Assistant</p>
              <p className="text-white/70 text-[10px] leading-tight">Powered by smart recommendations</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close assistant"
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Content Area ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Idle state: show suggestions ────────────────── */}
          {!loading && !currentResult && !error && (
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 bg-[#e8f0fe] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2874f0]" />
                </div>
                <div className="bg-[#f8f9ff] border border-[#e8f0fe] rounded-lg rounded-tl-none px-3 py-2.5 flex-1">
                  <p className="text-[13px] text-[#212121] leading-relaxed">
                    Hi! I can help you find the perfect product. Tell me what you're looking for — including your budget!
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <p className="text-[11px] text-[#878787] uppercase tracking-wide font-medium mb-2 px-1">
                Try asking
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="flex items-center gap-2 text-left px-3 py-2 rounded-sm border border-gray-200 bg-white hover:border-[#2874f0] hover:bg-[#f0f6ff] transition-colors text-[12px] text-[#212121] font-medium group"
                  >
                    <ChevronRight className="w-3 h-3 text-[#2874f0] flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading state ────────────────────────────────── */}
          {loading && (
            <div className="p-4">
              {/* Show the query bubble */}
              <div className="flex justify-end mb-4">
                <div className="bg-[#2874f0] text-white text-[12px] px-3 py-2 rounded-lg rounded-br-none max-w-[80%]">
                  {currentQuery}
                </div>
              </div>
              {/* Typing indicator */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 bg-[#e8f0fe] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#2874f0]" />
                </div>
                <div className="bg-[#f8f9ff] border border-[#e8f0fe] rounded-lg rounded-tl-none px-3 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2874f0] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2874f0] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2874f0] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
              {/* Skeleton cards */}
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── Error state ──────────────────────────────────── */}
          {!loading && error && (
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <div className="bg-[#2874f0] text-white text-[12px] px-3 py-2 rounded-lg rounded-br-none max-w-[80%]">
                  {currentQuery}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg rounded-tl-none px-3 py-2.5 flex-1">
                  <p className="text-[12px] text-red-600">{error}</p>
                  <button
                    onClick={handleNewSearch}
                    className="mt-2 text-[11px] text-[#2874f0] font-medium hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Results state ─────────────────────────────────── */}
          {!loading && currentResult && (
            <div className="p-4" ref={resultsRef}>
              {/* Past turns (history, collapsed) */}
              {history.length > 1 && (
                <div className="mb-4 border-b border-gray-100 pb-4">
                  {history.slice(0, -1).map((entry, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-end mb-1">
                        <div className="bg-[#2874f0] text-white text-[11px] px-2.5 py-1.5 rounded-lg rounded-br-none max-w-[80%]">
                          {entry.query}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#e8f0fe] rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-[#2874f0]" />
                        </div>
                        <p className="text-[11px] text-[#878787]">
                          Found {entry.result.products.length} product{entry.result.products.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current query bubble */}
              <div className="flex justify-end mb-4">
                <div className="bg-[#2874f0] text-white text-[12px] px-3 py-2 rounded-lg rounded-br-none max-w-[80%]">
                  {currentQuery}
                </div>
              </div>

              {/* AI response message */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 bg-[#e8f0fe] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-[#2874f0]" />
                </div>
                <div className="bg-[#f8f9ff] border border-[#e8f0fe] rounded-lg rounded-tl-none px-3 py-2.5 flex-1">
                  <p className="text-[12px] text-[#212121] leading-relaxed">
                    {currentResult.message}
                  </p>
                </div>
              </div>

              {/* Product recommendations */}
              {currentResult.products.length > 0 ? (
                <div className="space-y-2">
                  {currentResult.products.map((product) => (
                    <AssistantProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#878787]">
                  <p className="text-[12px]">No products found for your search.</p>
                  <p className="text-[11px] mt-1">Try different keywords or a higher budget.</p>
                </div>
              )}

              {/* New search prompt */}
              <button
                onClick={handleNewSearch}
                className="mt-4 w-full text-center text-[12px] text-[#2874f0] font-medium py-2 border border-[#2874f0] rounded-sm hover:bg-[#f0f6ff] transition-colors"
              >
                Search something else
              </button>
            </div>
          )}
        </div>

        {/* ── Input Footer ─────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-3 py-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id="ai-assistant-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Gaming laptop under ₹60k…"
              disabled={loading}
              className="flex-1 text-[13px] text-[#212121] placeholder-[#aaa] bg-[#f5f5f5] border border-gray-200 rounded-sm px-3 py-2 focus:outline-none focus:border-[#2874f0] focus:bg-white transition-colors disabled:opacity-60"
              aria-label="Ask the AI assistant"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim() || loading}
              aria-label="Send query"
              className="flex-shrink-0 w-9 h-9 bg-[#2874f0] hover:bg-[#1a65d6] disabled:bg-gray-300 text-white rounded-sm flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#aaa] mt-1.5 text-center">
            AI suggestions — always verify prices before purchasing
          </p>
        </div>
      </div>
    </>
  );
};
