"use client";
import React, { useState, useRef, useEffect } from "react";

// Chat Bubble
const ChatBubble = ({ message, isUser, isTyping }) => (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
    <div
      className={`rounded-2xl px-4 py-2 max-w-xs shadow
        ${isUser
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-800"
        }`}
    >
      {isTyping ? <span className="italic text-gray-400">กำลังพิมพ์...</span> : message}
    </div>
  </div>
);

// Chat Message List
const ChatMessageList = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto flex-1 px-4 py-2">
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} message={msg.text} isUser={msg.isUser} />
      ))}
      {isTyping && <ChatBubble isUser={false} isTyping={true} />}
      <div ref={bottomRef} />
    </div>
  );
};

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };
  return (
    <div className="flex gap-2 p-4 border-t bg-white">
      <input
        className="flex-1 border rounded-2xl px-4 py-2 outline-none"
        placeholder="พิมพ์ข้อความ..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-600 disabled:opacity-50"
        onClick={handleSend}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
};

// Main Page
function ChatGPTPage() {
  const [messages, setMessages] = useState([
    { text: "สวัสดีค่ะ มีอะไรให้ช่วยไหม", isUser: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // ดึงข้อความจาก OpenAI API ผ่าน /api/chat (แทน mock)
  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { text, isUser: true }]);
    setIsTyping(true);

    try {
      // เรียก API
      const res = await fetch("/api/farmer/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const botReply = data.reply || "ขออภัย เกิดข้อผิดพลาด";

      // Typing effect ทีละตัวอักษร
      let i = 0;
      setMessages((msgs) => [...msgs, { text: "", isUser: false }]);
      const reveal = () => {
        setMessages((msgs) => [
          ...msgs.slice(0, -1),
          { text: botReply.slice(0, i), isUser: false },
        ]);
        i++;
        if (i <= botReply.length) {
          setTimeout(reveal, 24);
        } else {
          setIsTyping(false);
        }
      };
      reveal();
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { text: "ขออภัย ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", isUser: false },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="text-xl font-bold p-4 border-b bg-white shadow-sm">
        ChatGPT
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList messages={messages} isTyping={isTyping} />
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

export default ChatGPTPage;
