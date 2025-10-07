import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Typography, Spin } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import './chatWindow.less';
import type { Message, User } from '../../types';
import { useAuth } from '../../contexts/AutoContext';
import { getMessages } from './service';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ChatWindowProps {
  selectedUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { currentUser, token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load message history
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser?.id) return;
      
      setLoading(true);
      try {
        const messageHistory = await getMessages(selectedUser.id);
        setMessages(messageHistory);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io('https://family-chat-backend-m58u.onrender.com', {
      query: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connected', (data) => {
      console.log('Connected as user:', data.userId);
    });

    newSocket.on('new_message', (message: Message) => {
      // Only add message if it's relevant to current conversation
      if (
        (message.senderId === currentUser?.id && message.receiverId === selectedUser.id) ||
        (message.senderId === selectedUser.id && message.receiverId === currentUser?.id)
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, currentUser, selectedUser]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !selectedUser) return;

    socket.emit('send_message', {
      receiverId: selectedUser.id,
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Avatar
          size={40}
          src={selectedUser.avatar}
          icon={!selectedUser.avatar && <UserOutlined />}
        />
        <div className="chat-header-info">
          <Title level={5}>{selectedUser.displayName}</Title>
          <Text type="secondary">{selectedUser.username}</Text>
        </div>
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-loading">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <Text type="secondary">No messages yet. Start the conversation!</Text>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`message ${isCurrentUser ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-content">
                  <Text>{message.content}</Text>
                  <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;