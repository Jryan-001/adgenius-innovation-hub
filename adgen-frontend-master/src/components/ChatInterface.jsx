import { useState, useRef, useEffect } from 'react';
import { chat } from '../services/api';
import { Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Simple markdown renderer
const renderMarkdown = (text) => {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
};

const DEFAULT_MESSAGE = { role: 'assistant', content: "Hi! I'm AdGenius AI. Tell me what kind of ad you'd like to create! ✨" };

export default function ChatInterface({
    onActionsReceived,
    canvasState = {},
    brand = 'Tesco',
    platform = 'instagram_story',
    height = 550
}) {
    const { user } = useAuth();

    // User-specific localStorage key
    const storageKey = user?.id ? `adgen_chat_history_${user.id}` : 'adgen_chat_history_guest';

    // Load chat history from localStorage on mount
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [DEFAULT_MESSAGE];
            }
        }
        return [DEFAULT_MESSAGE];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [messages, storageKey]);

    // Reset messages when user changes
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                setMessages([DEFAULT_MESSAGE]);
            }
        } else {
            setMessages([DEFAULT_MESSAGE]);
        }
    }, [user?.id]);

    // Clear chat function
    const clearChat = () => {
        setMessages([DEFAULT_MESSAGE]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await chat({
                message: userMessage,
                canvasState,
                brand,
                platform,
                chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                actions: data.actions
            }]);

            if (data.actions?.length > 0 && onActionsReceived) {
                onActionsReceived(data.actions);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⏳ Taking a quick break. Please try again in a moment!'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div
            style={{
                height: `${height}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px'
            }}
        >
            {/* Messages area - scrollable, takes available space */}
            <div
                className="chat-messages"
                style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    minHeight: 0
                }}
            >
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {msg.role === 'assistant' ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                        className="prose prose-sm max-w-none"
                                    />
                                ) : (
                                    msg.content
                                )}
                                {msg.actions?.length > 0 && (
                                    <div className="mt-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 inline-block">
                                        ✓ {msg.actions.length} change{msg.actions.length > 1 ? 's' : ''} applied
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                <span className="text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input - pinned to bottom */}
            <div
                style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    padding: '16px',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    borderBottomLeftRadius: '16px',
                    borderBottomRightRadius: '16px'
                }}
            >
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
                    <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your ad or ask for changes..."
                        className="flex-1 bg-transparent outline-none text-sm min-w-0"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className={`p-2 rounded-full transition flex-shrink-0 ${input.trim() ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                            }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
