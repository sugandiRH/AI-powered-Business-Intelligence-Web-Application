import { useState } from "react";
import { X, Send } from "lucide-react";
import api from "../../services/api";

const SAMPLE_QUESTIONS = [
    "What is my total revenue?",
    "Which month had the best sales?",
    "What is my top product?",
    "Which category leads?",
    "Give me a business summary",
    "What should I improve?",
];

export default function ChatPanel({ datasetId, onClose }) {
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hi! Ask me anything about your dataset." }
    ]);
    const [input, setInput]     = useState("");
    const [loading, setLoading] = useState(false);

    const send = async (question) => {
        const q = question || input.trim();
        if (!q) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: q }]);
        setLoading(true);
        try {
            const res = await api.post("/chatbot_question", {
                dataset_id: datasetId,
                question: q
            });
            console.log("FULL RESPONSE:", res.data);  
            setMessages(prev => [...prev, { role: "bot", text: res.data.data.answer }]);
        } catch {
            setMessages(prev => [...prev, { role: "bot", text: "Sorry, something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col shrink-0">
            
            {/* header */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div>
                        <p className="text-sm font-medium text-white">AI Assistant</p>
                        <p className="text-xs text-gray-500">Ask about your data</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            {/* sample questions */}
            <div className="px-3 py-2 border-b border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Try asking</p>
                <div className="flex flex-wrap gap-1">
                    {SAMPLE_QUESTIONS.map(q => (
                        <button
                            key={q}
                            onClick={() => send(q)}
                            className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-300 transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                            m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                : "bg-gray-800 border border-gray-700 text-gray-300 rounded-tl-sm"
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 border border-gray-700 rounded-xl rounded-tl-sm px-3 py-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* input */}
            <div className="p-3 border-t border-gray-700 flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Ask about your data..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                />
                <button
                    onClick={() => send()}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-3 py-2 transition-colors"
                >
                    <Send size={14} className="text-white" />
                </button>
            </div>

        </div>
    );
}