import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CREATE_FORM_TOOL, FORM_GENERATOR_SYSTEM_PROMPT, processFormToolCall } from '../utils/aiFormTools';
import { useFormStore } from '../store/formStore';
import { useNotification } from './Notification';
import { API_URL } from '../config';
import './AIChat.css';

const CHAT_HISTORY_KEY = 'ai_chat_history';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  formSchema?: any;
  toolCall?: boolean;
}

interface ChatSession {
  id: string;
  messages: Message[];
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AIChatProps {
  isVisible: boolean;
  onFormsRefresh?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isVisible, onFormsRefresh }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedFormJson, setSelectedFormJson] = useState<string>('');
  const [selectedFormName, setSelectedFormName] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { setSchema, currentFormId } = useFormStore();
  const { showNotification, showConfirm } = useNotification();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session and load history
  useEffect(() => {
    if (!currentSessionId) {
      setCurrentSessionId(Date.now().toString());
    }
    loadChatHistory();
  }, []);

  // Save current session to history
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      saveChatSession();
    }
  }, [messages]);

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const history = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const saveChatSession = () => {
    try {
      const summary = generateSummary(messages);
      const session: ChatSession = {
        id: currentSessionId,
        messages,
        summary,
        createdAt: new Date(parseInt(currentSessionId)),
        updatedAt: new Date(),
      };

      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      let history: ChatSession[] = stored ? JSON.parse(stored) : [];

      // Update or add session
      const index = history.findIndex((s) => s.id === currentSessionId);
      if (index >= 0) {
        history[index] = session;
      } else {
        history.unshift(session);
      }

      // Keep only last 20 sessions
      history = history.slice(0, 20);

      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
      loadChatHistory();
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  };

  const generateSummary = (msgs: Message[]): string => {
    const userMessages = msgs.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return 'New chat';

    const firstMessage = userMessages[0].content;
    const preview = firstMessage.length > 60 ? firstMessage.substring(0, 60) + '...' : firstMessage;
    return preview;
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(Date.now().toString());
  };

  const loadChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistoryModal(false);
  };

  const deleteChatSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm('Delete this chat?', () => {
      try {
        const stored = localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
          let history: ChatSession[] = JSON.parse(stored);
          history = history.filter((s) => s.id !== sessionId);
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
          loadChatHistory();

          if (currentSessionId === sessionId) {
            startNewChat();
          }

          showNotification('Chat deleted', 'success');
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
        showNotification('Failed to delete chat', 'error');
      }
    });
  };

  const copyMessageContent = (content: string) => {
    navigator.clipboard.writeText(content);
    showNotification('Message copied!', 'success');
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      // Add cancelled message
      const cancelledMessage: Message = {
        role: 'assistant',
        content: '[Generation cancelled]',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cancelledMessage]);

      showNotification('Generation stopped', 'info');
    }
  };

  const sendMessage = async () => {
    // If already loading, stop instead
    if (isLoading) {
      stopGeneration();
      return;
    }

    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Together API integration with tool calling
      const apiKey = import.meta.env.VITE_TOGETHER_API_KEY || 'your-api-key-here';

      // Build messages array with system prompt
      const apiMessages = [
        { role: 'system', content: FORM_GENERATOR_SYSTEM_PROMPT },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: inputText }
      ];

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
          messages: apiMessages,
          tools: [CREATE_FORM_TOOL],
          tool_choice: 'auto',
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1,
          stop: ['<|eot_id|>', '<|eom_id|>'],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      // Check if there's a tool call
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0];

        if (toolCall.function.name === 'create_form') {
          try {
            const toolArgs = JSON.parse(toolCall.function.arguments);
            const formSchema = processFormToolCall(toolArgs);

            const assistantMessage: Message = {
              role: 'assistant',
              content: `I've created a form called "${formSchema.name}". You can add it as a new form or replace your current form with it.`,
              timestamp: new Date(),
              formSchema,
              toolCall: true,
            };

            setMessages((prev) => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Error processing tool call:', error);
            const errorMessage: Message = {
              role: 'assistant',
              content: 'I tried to create a form, but there was an error processing the schema.',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        }
      } else {
        // Regular text response
        const assistantMessage: Message = {
          role: 'assistant',
          content: choice.message?.content || 'Sorry, I could not generate a response.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error calling Together API:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please check your API key and try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const addAsNewForm = async (formSchema: any) => {
    try {
      const response = await fetch(`${API_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formSchema.code || '',
          name: formSchema.name,
          description: formSchema.description || '',
          schema_json: formSchema,
          parent_id: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create form');

      const savedForm = await response.json();
      setSchema(formSchema, savedForm.id);

      if (onFormsRefresh) {
        onFormsRefresh();
      }

      showNotification('Form added to database!', 'success');
    } catch (error) {
      console.error('Error adding form:', error);
      showNotification('Failed to add form to database', 'error');
    }
  };

  const replaceCurrentForm = async (formSchema: any) => {
    if (!currentFormId) {
      showNotification('No form is currently selected', 'error');
      return;
    }

    showConfirm(
      'Are you sure you want to replace the current form? This will overwrite all its content.',
      async () => {
        try {
          const response = await fetch(`${API_URL}/api/forms/${currentFormId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: formSchema.code || '',
              name: formSchema.name,
              description: formSchema.description || '',
              schema_json: formSchema,
            }),
          });

          if (!response.ok) throw new Error('Failed to update form');

          setSchema(formSchema, currentFormId);

          if (onFormsRefresh) {
            onFormsRefresh();
          }

          showNotification('Form replaced successfully!', 'success');
        } catch (error) {
          console.error('Error replacing form:', error);
          showNotification('Failed to replace form', 'error');
        }
      }
    );
  };

  const viewFormJson = (formSchema: any) => {
    setSelectedFormJson(JSON.stringify(formSchema, null, 2));
    setSelectedFormName(formSchema.name || 'form');
    setShowJsonModal(true);
  };

  const downloadFormJson = () => {
    const blob = new Blob([selectedFormJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFormName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('JSON downloaded!', 'success');
  };

  const copyFormJson = () => {
    navigator.clipboard.writeText(selectedFormJson);
    showNotification('JSON copied to clipboard!', 'success');
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-header-actions">
          <button
            className="ai-header-btn"
            onClick={() => setShowHistoryModal(true)}
            title="Chat History"
          >
            <HistoryIcon fontSize="small" />
          </button>
          <button
            className="ai-header-btn"
            onClick={startNewChat}
            title="New Chat"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 ? (
          <div className="ai-chat-empty">
            <p>Describe a form you want to create, and I'll generate it for you!</p>
            <p className="ai-chat-hint">Example: "Create a contact form with name, email, phone, and message fields"</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`ai-chat-message ${message.role}`}>
              <div className="message-header">
                <button
                  className="message-copy-btn"
                  onClick={() => copyMessageContent(message.content)}
                  title="Copy message"
                >
                  <ContentCopyIcon fontSize="small" />
                </button>
              </div>
              <div className="message-content">{message.content}</div>
              {message.formSchema && (
                <div className="form-preview">
                  <div className="form-preview-info">
                    <div className="form-preview-title">Form: {message.formSchema.name}</div>
                    <div className="form-preview-desc">
                      {message.formSchema.description || 'No description'}
                    </div>
                    <div className="form-preview-count">
                      Components: {message.formSchema.components?.length || 0}
                    </div>
                  </div>
                  <div className="form-preview-toolbar">
                    <button
                      className="form-toolbar-btn"
                      onClick={() => viewFormJson(message.formSchema)}
                      title="View JSON"
                    >
                      <CodeIcon fontSize="small" />
                    </button>
                    <button
                      className="form-toolbar-btn"
                      onClick={() => addAsNewForm(message.formSchema)}
                      title="Add as New Form"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                    <button
                      className="form-toolbar-btn"
                      onClick={() => replaceCurrentForm(message.formSchema)}
                      disabled={!currentFormId}
                      title="Replace Current Form"
                    >
                      <SwapHorizIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="ai-chat-message assistant loading">
            <div className="message-content">
              <span className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-container">
        <textarea
          className="ai-chat-input"
          placeholder="Ask AI anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          className={`ai-chat-send-btn ${isLoading ? 'stop' : ''}`}
          onClick={sendMessage}
          disabled={!inputText.trim() && !isLoading}
          title={isLoading ? 'Stop generation' : 'Send message'}
        >
          {isLoading ? <StopIcon fontSize="small" /> : <SendIcon fontSize="small" />}
        </button>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="ai-json-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="ai-json-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-json-modal-header">
              <h3>Chat History</h3>
              <button className="ai-json-modal-close" onClick={() => setShowHistoryModal(false)}>
                ×
              </button>
            </div>
            <div className="ai-json-modal-body">
              {chatHistory.length === 0 ? (
                <div className="history-empty">No chat history yet</div>
              ) : (
                <div className="history-list">
                  {chatHistory.map((session) => (
                    <div
                      key={session.id}
                      className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                      onClick={() => loadChatSession(session)}
                    >
                      <div className="history-item-header">
                        <span className="history-time">
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                        <button
                          className="history-delete-btn"
                          onClick={(e) => deleteChatSession(session.id, e)}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                      <div className="history-summary">{session.summary}</div>
                      <div className="history-meta">
                        {session.messages.length} messages
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="ai-json-modal-footer">
              <button className="ai-json-btn secondary" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="ai-json-modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div className="ai-json-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-json-modal-header">
              <h3>Form JSON: {selectedFormName}</h3>
              <button className="ai-json-modal-close" onClick={() => setShowJsonModal(false)}>
                ×
              </button>
            </div>
            <div className="ai-json-modal-body">
              <pre className="ai-json-content">{selectedFormJson}</pre>
            </div>
            <div className="ai-json-modal-footer">
              <button className="ai-json-btn secondary" onClick={() => setShowJsonModal(false)}>
                Close
              </button>
              <button className="ai-json-btn secondary" onClick={copyFormJson}>
                Copy to Clipboard
              </button>
              <button className="ai-json-btn primary" onClick={downloadFormJson}>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
