import {
  OllamaMessage,
  OllamaResponse,
  ollamaService,
} from '@/services/ollama-service';
import { ClearOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Input, List, Select, Space, Spin } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const OllamaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadModels = () => {
    ollamaService
      .listModels()
      .then((response) => {
        setAvailableModels(response.models.map((m) => m.name));
      })
      .catch((err) => {
        console.error('Failed to load models:', err);
        setError('Failed to load models: ' + err.message);
      });
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    const ollamaMessages: OllamaMessage[] = [];

    [...messages, userMessage].forEach((msg) => {
      ollamaMessages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    ollamaService
      .chatStream(
        {
          model: selectedModel,
          messages: ollamaMessages,
        },
        (chunk: OllamaResponse) => {
          if (chunk.message?.content) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + chunk.message.content,
                  },
                ];
              }
              return prev;
            });
          }
        },
      )
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Ollama Chat" style={{ marginBottom: '20px' }}>
        <Space style={{ marginBottom: '20px' }}>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 200 }}
            placeholder="Select Model"
          >
            {availableModels.map((model) => (
              <Option key={model} value={model}>
                {model}
              </Option>
            ))}
          </Select>
          <Button onClick={loadModels}>Load Models</Button>
          <Button onClick={clearMessages} icon={<ClearOutlined />}>
            Clear Chat
          </Button>
        </Space>

        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
            Error: {error}
          </div>
        )}

        <div
          style={{
            height: '400px',
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            padding: '10px',
            marginBottom: '20px',
          }}
        >
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                style={{
                  justifyContent:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor:
                      message.role === 'user' ? '#1890ff' : '#f0f0f0',
                    color: message.role === 'user' ? 'white' : 'black',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div>{message.content}</div>
                </div>
              </List.Item>
            )}
          />
          {isLoading && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Spin />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={3}
            disabled={isLoading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OllamaChat;
