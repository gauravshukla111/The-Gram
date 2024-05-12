import React, { useState, useEffect } from "react";
import "./PrivatemsgChat.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const PrivatemsgChat = (props) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { user } = useParams();
  

  const socket = io();
  // const socket = io("http://localhost:5000");

 const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const sendMessageToServer = (message) => {
    socket.emit("sendmsg", { user: user, message:`${user}:${message}` });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { text:`You:${inputValue}`, sender: "user" }]);
      sendMessageToServer(inputValue); // Moved sendMessageToServer here
      setInputValue("");
    }
  };

  useEffect(() => {
    socket.on("servermsg", (msg) => {
      setMessages(prevMessages => [...prevMessages, { text: msg, sender: "other" }]);
      console.log(msg)
    });
  
    return () => {
      socket.disconnect();
    };
  }, [socket]);





  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "user" ? "user" : "other"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleInputChange}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default PrivatemsgChat;
