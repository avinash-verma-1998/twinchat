import { useState, useEffect } from "react";
import "./App.css";
import ChatMessage from "./Message";

function App() {
  const [messages, setMessages] = useState<
    Array<{
      id: number | string;
      text: string;
      user: boolean;
      createdAt: Date;
    }>
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add a welcome message when the component mounts
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I am Avinash's Digital twin, How can I assist you today?",
        user: false,
        createdAt: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to the list
    const userMessage = {
      id: Date.now(),
      text: text,
      user: true,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare the history for the API (excluding the current message we just added)
      const history = messages.map((msg) => ({
        role: msg.user ? "user" : "assistant",
        content: msg.text,
      }));

      // Call the API
      // const response = await fetch("http://localhost:8000/chat", {
      const response = await fetch("https://be-m1xs.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.message || "Sorry, I encountered an error.";

      // Add bot response to the list
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        user: false,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, there was an error processing your request.",
        user: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="message-list">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.user ? "user-message" : "bot-message"}`}
            >
              <ChatMessage text={message.text} />
              <div className="message-time">
                {message.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage(inputValue);
              }
            }}
            disabled={isLoading}
            placeholder="Type a message..."
            className="message-input"
          />
          <button
            onClick={() => !isLoading && handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
