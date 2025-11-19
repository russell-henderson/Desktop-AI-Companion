// src/renderer/App.js
import React, { useState } from 'react';
import './styles/App.css'; // Optional custom CSS or your chosen UI framework
import { Configuration, OpenAIApi } from 'openai';

function App() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');

  // Create configuration object with your API key
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Make sure you define this in your .env file
  });
  const openai = new OpenAIApi(configuration);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Example call to the OpenAI API
      const res = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: userInput,
        max_tokens: 50,
      });
      setResponse(res.data.choices[0].text.trim());
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Electron + OpenAI Assistant</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button type="submit">Send to OpenAI</button>
      </form>
      <div className="response-container">
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;