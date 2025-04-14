
import { useState, useRef, useEffect } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  if (minimized) {
    return (
      <div className="text-right p-4">
        <button
          onClick={() => setMinimized(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Open Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[90vh] w-full">
      <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-xl">
        <span className="font-semibold">Rental Assistant</span>
        <button onClick={() => setMinimized(true)} className="text-white text-lg font-bold">–</button>
      </div>
      <div className="flex-1 overflow-y-auto border-x border-b rounded-b-xl p-4 bg-white shadow-inner">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-100 text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {typing && (
          <div className="mb-3 p-3 rounded-lg max-w-[80%] bg-gray-100 text-left italic text-gray-500">
            Assistant is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t bg-white p-3 flex flex-col">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="mt-2 self-end px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
