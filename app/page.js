'use client';

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  OutlinedInput,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Saad's support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#f0f2f5',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#fff',
          borderRadius: 3,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((message, index) => (
            <Paper
              key={index}
              sx={{
                padding: 1.5,
                borderRadius: 2,
                backgroundColor:
                  message.role === 'assistant' ? '#f1f3f4' : '#7e21ff',
                color: message.role === 'assistant' ? '#000' : '#fff',
                alignSelf:
                  message.role === 'assistant' ? 'flex-start' : 'flex-end',
                marginBottom: 1,
                maxWidth: '80%',
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  color: message.role === 'assistant' ? '#000' : '#fff',
                  marginBottom: 0.5,
                }}
              >
                {message.role === 'assistant' ? 'Assistant' : 'User'}
              </Typography>
              <Typography variant="body2">{message.content}</Typography>
            </Paper>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          component="form"
          sx={{
            display: 'flex',
            padding: 2,
            borderTop: '1px solid #e0e0e0',
          }}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <OutlinedInput
            placeholder="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            endAdornment={
              <IconButton
                type="submit"
                color="primary"
                disabled={isLoading}
                sx={{ color: '#7e21ff' }}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            }
            sx={{
              padding: 0.5,
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: 1,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
