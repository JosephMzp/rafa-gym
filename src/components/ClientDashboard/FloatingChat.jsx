import { useState, useRef, useEffect } from 'react';
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiCpu,
  FiZap,
  FiRefreshCw,
} from 'react-icons/fi';
import { useGymChat } from '../../hooks/useGymChat';

/**
 * Renderiza texto del bot con formato básico:
 * - Líneas que empiezan con '•' se muestran como viñetas con sangría
 * - Texto entre **...** se muestra en negrita
 * - Líneas vacías crean separación visual
 */
function renderBotText(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line === '') return <br key={i} />;
    // Renderizar negritas: **texto**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    const isBullet = line.trimStart().startsWith('•');
    return (
      <span
        key={i}
        style={isBullet ? { display: 'block', paddingLeft: '0.5rem' } : { display: 'block' }}
      >
        {parts}
      </span>
    );
  });
}

/* ─── Typing Indicator ─── */
function TypingIndicator() {
  return (
    <div className="fc-message fc-message--bot" aria-live="polite" aria-label="El asistente está escribiendo">
      <div className="fc-avatar fc-avatar--bot">
        <FiCpu size={14} />
      </div>
      <div className="fc-bubble fc-bubble--bot fc-bubble--typing">
        <span className="fc-dot" style={{ animationDelay: '0ms' }} />
        <span className="fc-dot" style={{ animationDelay: '160ms' }} />
        <span className="fc-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  );
}

/* ─── Single Message Bubble ─── */
function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`fc-message ${isUser ? 'fc-message--user' : 'fc-message--bot'}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {!isUser && (
        <div className="fc-avatar fc-avatar--bot" aria-hidden="true">
          <FiCpu size={14} />
        </div>
      )}

      <div className={`fc-bubble ${isUser ? 'fc-bubble--user' : 'fc-bubble--bot'}`}>
        {isUser ? message.text : renderBotText(message.text)}
      </div>

      {isUser && (
        <div className="fc-avatar fc-avatar--user" aria-hidden="true">
          Tú
        </div>
      )}
    </div>
  );
}

/* ─── Main FloatingChat Component ─── */
export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading, resetChat } = useGymChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleReset = () => {
    resetChat();
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        /* ── Floating Button ── */
        .fc-fab {
          position: fixed;
          bottom: 1.75rem;
          right: 1.75rem;
          z-index: 1200;
          width: 58px;
          height: 58px;
          border-radius: var(--radius-full);
          background: var(--gradient-primary);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.45), var(--shadow-lg);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
          outline: none;
        }
        .fc-fab:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 32px rgba(249, 115, 22, 0.55), var(--shadow-xl);
        }
        .fc-fab:active {
          transform: scale(0.96);
        }
        .fc-fab-icon {
          transition: transform var(--transition-base), opacity var(--transition-base);
        }
        .fc-fab-icon--hidden {
          opacity: 0;
          transform: rotate(90deg) scale(0.5);
          position: absolute;
        }
        .fc-fab-icon--visible {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        /* Pulse ring when closed */
        .fc-fab::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: var(--radius-full);
          border: 2px solid rgba(249, 115, 22, 0.4);
          animation: fc-pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fc-pulse-ring {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.25); }
        }

        /* Notification badge */
        .fc-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background: var(--success);
          border: 2px solid var(--dark-900);
          animation: fc-badge-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes fc-badge-in {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── Widget Window ── */
        .fc-widget {
          position: fixed;
          bottom: 5.5rem;
          right: 1.75rem;
          z-index: 1200;
          width: 370px;
          max-height: 560px;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-2xl);
          background: var(--dark-800);
          border: 1px solid var(--border-default);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle);
          overflow: hidden;
          transform-origin: bottom right;
        }
        .fc-widget--enter {
          animation: fc-widget-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .fc-widget--exit {
          animation: fc-widget-exit 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes fc-widget-enter {
          from { opacity: 0; transform: scale(0.85) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes fc-widget-exit {
          from { opacity: 1; transform: scale(1)    translateY(0);    }
          to   { opacity: 0; transform: scale(0.85) translateY(16px); }
        }

        /* ── Header ── */
        .fc-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.125rem;
          background: var(--surface-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .fc-header-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-lg);
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: var(--shadow-glow);
          flex-shrink: 0;
        }
        .fc-header-info {
          flex: 1;
          min-width: 0;
        }
        .fc-header-title {
          font-family: var(--font-display);
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .fc-header-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--success);
          margin-top: 2px;
        }
        .fc-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--success);
          animation: fc-status-pulse 2s ease-in-out infinite;
        }
        @keyframes fc-status-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50%       { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0);  }
        }
        .fc-close-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .fc-close-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          border-color: var(--border-default);
        }

        /* ── Messages Area ── */
        .fc-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          scroll-behavior: smooth;
        }
        .fc-messages::-webkit-scrollbar { width: 4px; }
        .fc-messages::-webkit-scrollbar-thumb {
          background: var(--dark-400);
          border-radius: 2px;
        }

        /* ── Message Row ── */
        .fc-message {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          animation: fc-msg-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes fc-msg-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .fc-message--user {
          flex-direction: row-reverse;
        }

        /* ── Avatars ── */
        .fc-avatar {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: 700;
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }
        .fc-avatar--bot {
          background: linear-gradient(135deg, var(--dark-500), var(--dark-400));
          color: var(--primary-400);
          border: 1px solid var(--border-default);
        }
        .fc-avatar--user {
          background: var(--gradient-primary);
          color: #fff;
        }

        /* ── Bubbles ── */
        .fc-bubble {
          max-width: 80%;
          padding: 0.625rem 0.875rem;
          border-radius: 1.125rem;
          font-size: 0.875rem;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .fc-bubble--user {
          background: var(--gradient-primary);
          color: #fff;
          border-bottom-right-radius: 0.35rem;
          box-shadow: 0 2px 12px rgba(249, 115, 22, 0.3);
        }
        .fc-bubble--bot {
          background: var(--dark-600);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 0.35rem;
        }

        /* Typing dots */
        .fc-bubble--typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.75rem 1rem;
        }
        .fc-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: fc-bounce 1.2s ease-in-out infinite both;
        }
        @keyframes fc-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }

        /* ── Input Zone ── */
        .fc-input-zone {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          border-top: 1px solid var(--border-subtle);
          background: var(--surface-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .fc-input {
          flex: 1;
          padding: 0.5625rem 0.875rem;
          background: var(--dark-700);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: var(--font-body);
          transition: all var(--transition-fast);
          outline: none;
        }
        .fc-input::placeholder { color: var(--text-muted); }
        .fc-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .fc-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .fc-send-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background: var(--gradient-primary);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: var(--shadow-glow);
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .fc-send-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: var(--shadow-glow-lg);
        }
        .fc-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Powered By ── */
        .fc-footer {
          text-align: center;
          padding: 0.375rem 1rem 0.625rem;
          font-size: 0.6875rem;
          color: var(--text-muted);
          background: var(--surface-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          border-top: 1px solid var(--border-subtle);
        }
        .fc-footer-icon {
          color: var(--primary-500);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .fc-widget {
            right: 0.75rem;
            left: 0.75rem;
            width: auto;
            bottom: 5rem;
          }
          .fc-fab {
            bottom: 1.25rem;
            right: 1.25rem;
          }
        }
      `}</style>

      {/* ── Chat Widget ── */}
      {isOpen && (
        <div
          className="fc-widget fc-widget--enter"
          role="dialog"
          aria-modal="true"
          aria-label="Asistente virtual RafaGym"
        >
          {/* Header */}
          <div className="fc-header">
            <div className="fc-header-icon" aria-hidden="true">
              <FiCpu size={18} />
            </div>
            <div className="fc-header-info">
              <div className="fc-header-title">RafaBot</div>
              <div className="fc-header-status">
                <span className="fc-status-dot" />
                {isLoading ? 'Pensando…' : 'En línea · IA Activa'}
              </div>
            </div>
            <button
              className="fc-close-btn"
              onClick={handleReset}
              aria-label="Nueva conversación"
              id="fc-reset-btn"
              title="Nueva conversación"
            >
              <FiRefreshCw size={14} />
            </button>
            <button
              className="fc-close-btn"
              onClick={handleClose}
              aria-label="Cerrar chat"
              id="fc-close-btn"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="fc-messages" role="log" aria-live="polite">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} index={index} />
            ))}

            {isLoading && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Zone */}
          <div className="fc-input-zone">
            <input
              ref={inputRef}
              id="fc-chat-input"
              className="fc-input"
              type="text"
              placeholder={isLoading ? 'Esperando respuesta…' : 'Escribe tu pregunta…'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Campo de texto para enviar mensaje al asistente"
              autoComplete="off"
            />
            <button
              id="fc-send-btn"
              className="fc-send-btn"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar mensaje"
            >
              <FiSend size={15} />
            </button>
          </div>

          {/* Footer */}
          <div className="fc-footer">
            <FiZap size={11} className="fc-footer-icon" />
            Impulsado por Gemini AI
          </div>
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        id="fc-fab-btn"
        className="fc-fab"
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
        aria-expanded={isOpen}
        aria-controls="fc-widget"
      >
        {/* Closed state: message icon */}
        <FiMessageCircle
          size={24}
          className={`fc-fab-icon ${isOpen ? 'fc-fab-icon--hidden' : 'fc-fab-icon--visible'}`}
          aria-hidden="true"
        />
        {/* Open state: close icon */}
        <FiX
          size={22}
          className={`fc-fab-icon ${isOpen ? 'fc-fab-icon--visible' : 'fc-fab-icon--hidden'}`}
          aria-hidden="true"
        />

        {/* Notification badge (only when closed) */}
        {!isOpen && (
          <span className="fc-badge" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
