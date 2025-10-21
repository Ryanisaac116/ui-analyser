import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    // Use the proxied API endpoint
    const apiUrl = '/api/v1/prediction/342ded6c-6fb9-4750-82d5-8380dc576885';

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
      const botResponse = data?.text || data?.answer || data?.output || 'I received your message, but the response was empty.';
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #e0e0e0;
          overflow-x: hidden;
        }

        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .floating-element {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent);
          animation: float 6s ease-in-out infinite;
        }

        .floating-element:nth-child(1) {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-element:nth-child(2) {
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 40px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          border: none;
          padding: 16px 40px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
        }

        .btn-secondary {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          padding: 16px 40px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        }

        .btn-secondary:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }
      ` }} />
      <div className="grid-background"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', color: '#e0e0e0' }}>

      <div className="relative z-10">
        {/* Header */}
        <header style={{ 
          padding: '30px 0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '20px',
          paddingRight: '20px'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white'
            }}>
              🔍
            </div>
            UI Analyser
          </div>
          <Link
            to="/"
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {/* Hero Section */}
          <section style={{
            textAlign: 'center',
            padding: '100px 0',
            position: 'relative'
          }}>
            <h1 style={{
              fontSize: '64px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #ffffff, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeInUp 1s ease'
            }}>
              Start Analyzing Your UI
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#a0a0a0',
              marginBottom: '40px',
              animation: 'fadeInUp 1s ease 0.2s both',
              maxWidth: '800px',
              margin: '0 auto 40px auto'
            }}>
              Upload screenshots, describe issues, or ask questions about UI bugs and our AI agent will help you identify and resolve them.
            </p>
          </section>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            padding: '80px 0'
          }}>
            <div className="feature-card">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px'
              }}>
                🐛
              </div>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '15px',
                color: '#ffffff'
              }}>Bug Detection</h3>
              <p style={{
                color: '#a0a0a0',
                lineHeight: '1.6'
              }}>
                Describe the issue you're facing and get instant analysis and solutions.
              </p>
            </div>

            <div className="feature-card">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px'
              }}>
                💬
              </div>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '15px',
                color: '#ffffff'
              }}>AI Assistant</h3>
              <p style={{
                color: '#a0a0a0',
                lineHeight: '1.6'
              }}>
                Chat with our intelligent agent to troubleshoot UI problems in real-time.
              </p>
            </div>

            <div className="feature-card">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px'
              }}>
                ⚡
              </div>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '15px',
                color: '#ffffff'
              }}>Quick Solutions</h3>
              <p style={{
                color: '#a0a0a0',
                lineHeight: '1.6'
              }}>
                Get actionable recommendations and code fixes to resolve issues fast.
              </p>
            </div>
          </div>

          {/* Chat Activation Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            margin: '80px 0'
          }}>
            {!showChat ? (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 30px auto',
                  fontSize: '36px'
                }}>
                  💬
                </div>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '20px'
                }}>
                  Ready to Analyze?
                </h2>
                <p style={{
                  color: '#a0a0a0',
                  marginBottom: '40px',
                  maxWidth: '600px',
                  margin: '0 auto 40px auto',
                  fontSize: '18px'
                }}>
                  Click the button below to open the AI chat assistant. You can describe bugs or ask any questions about UI issues.
                </p>
                <button
                  onClick={() => setShowChat(true)}
                  className="btn-primary"
                  style={{
                    animation: 'fadeInUp 1s ease 0.4s both'
                  }}
                >
                  Launch AI Assistant
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{
                    color: '#10b981',
                    fontWeight: '600',
                    fontSize: '18px'
                  }}>AI Assistant Active</span>
                </div>
                <p style={{
                  color: '#a0a0a0',
                  marginBottom: '20px',
                  fontSize: '18px'
                }}>
                  Chat interface is now open below. Start describing your UI issues!
                </p>
                <button
                  onClick={() => setShowChat(false)}
                  className="btn-secondary"
                >
                  Close Assistant
                </button>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          {showChat && (
            <div style={{
              marginTop: '40px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Chat Header */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🤖
                  </div>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontWeight: '600',
                      margin: 0,
                      fontSize: '18px'
                    }}>UI Analysis Assistant</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      margin: 0
                    }}>Powered by Flowise AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{
                height: '400px',
                overflowY: 'auto',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      borderRadius: '16px',
                      padding: '15px 20px',
                      whiteSpace: 'pre-wrap',
                      background: msg.type === 'user'
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: msg.type === 'user' ? 'white' : '#e0e0e0',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#e0e0e0',
                      borderRadius: '16px',
                      padding: '15px 20px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#a0a0a0',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#a0a0a0',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite 0.2s'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#a0a0a0',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite 0.4s'
                        }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your UI issue..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '15px 20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      outline: 'none',
                      fontSize: '16px'
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      padding: '15px 25px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      opacity: (!inputText.trim() || isLoading) ? 0.5 : 1,
                      pointerEvents: (!inputText.trim() || isLoading) ? 'none' : 'auto'
                    }}
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div style={{
            marginTop: '80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            <div className="feature-card">
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '20px'
              }}>How to Use</h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>1.</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>Click "Launch AI Assistant" to activate the chat</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>2.</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>Describe your UI bug in the chat input</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>3.</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>Get instant analysis and actionable solutions</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>4.</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>Ask follow-up questions for clarification</span>
                </li>
              </ul>
            </div>

            <div className="feature-card">
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '20px'
              }}>What You Can Ask</h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#8b5cf6',
                    fontSize: '18px'
                  }}>•</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>"Why is my button not aligning properly?"</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#8b5cf6',
                    fontSize: '18px'
                  }}>•</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>"Can you help me fix this responsive layout issue?"</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#8b5cf6',
                    fontSize: '18px'
                  }}>•</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>"My CSS is not working as expected"</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{
                    color: '#8b5cf6',
                    fontSize: '18px'
                  }}>•</span>
                  <span style={{ color: '#a0a0a0', lineHeight: '1.6' }}>"How do I improve accessibility for this component?"</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}