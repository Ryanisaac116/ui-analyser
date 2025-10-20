import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bug, MessageSquare, Zap, Send, X, Search, Bot } from 'lucide-react';

// Define a type for our message objects for better type safety
type Message = {
  type: 'bot' | 'user';
  text: string;
};

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: 'Hello! I\'m your UI Analysis Assistant. How can I help you debug your interface today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the chat when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    // Use an environment variable for the API URL
    const apiUrl = import.meta.env.VITE_FLOWISE_API_URL;
    
    if (!apiUrl) {
        console.error("VITE_FLOWISE_API_URL is not defined in your .env file.");
        setMessages(prev => [...prev, {
            type: 'bot',
            text: "Configuration error: The API URL is not set. Please contact the administrator."
        }]);
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          overrideConfig: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Safely access the response text
      const botResponse = data?.text || 'I received your message, but the response was empty.';
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    } catch (error: any) {
      console.error('Connection error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: `Connection error: ${error.message}. Please check:\n1. Flowise is running.\n2. The chatflow ID is correct.\n3. CORS is enabled in Flowise settings.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Search size={22} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                UI Analyser
              </span>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-4">
              Start Analyzing Your UI
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Upload screenshots, describe issues, or ask questions about UI bugs and our AI agent will help you identify and resolve them.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Bug className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Bug Detection</h3>
              <p className="text-slate-400">
                Describe the issue you're facing and get instant analysis and solutions.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
              <p className="text-slate-400">
                Chat with our intelligent agent to troubleshoot UI problems in real-time.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quick Solutions</h3>
              <p className="text-slate-400">
                Get actionable recommendations and code fixes to resolve issues fast.
              </p>
            </div>
          </div>

          {/* Chat Activation Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
            {!showChat ? (
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="text-white" size={36} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Analyze?
                </h2>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                  Click the button below to open the AI chat assistant. You can describe bugs or ask any questions about UI issues.
                </p>
                <button
                  onClick={() => setShowChat(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-1"
                >
                  Launch AI Assistant
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">AI Assistant Active</span>
                </div>
                <p className="text-slate-400 mb-4">
                  Chat interface is now open below. Start describing your UI issues!
                </p>
                <button
                  onClick={() => setShowChat(false)}
                  className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-800/50 transition-all"
                >
                  Close Assistant
                </button>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          {showChat && (
            <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">UI Analysis Assistant</h3>
                    <p className="text-white/80 text-sm">Powered by Flowise AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-slate-700/50 text-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700/50 text-slate-200 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-700/50 p-4 flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your UI issue..."
                    className="flex-1 bg-slate-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">How to Use</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Click "Launch AI Assistant" to activate the chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Describe your UI bug in the chat input</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Get instant analysis and actionable solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Ask follow-up questions for clarification</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">What You Can Ask</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">•</span>
                  <span>"Why is my button not aligning properly?"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">•</span>
                  <span>"Can you help me fix this responsive layout issue?"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">•</span>
                  <span>"My CSS is not working as expected"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">•</span>
                  <span>"How do I improve accessibility for this component?"</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
