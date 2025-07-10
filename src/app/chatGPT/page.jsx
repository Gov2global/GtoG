"use client";
import React, { useState, useRef, useEffect } from "react";

// Helper สำหรับแปลง file เป็น base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // remove "data:image/xxx;base64,"
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Chat Bubble (รองรับข้อความ + รูป)
const ChatBubble = ({ message, isUser, isTyping, image }) => (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
    <div
      className={`rounded-2xl px-4 py-2 max-w-xs shadow break-words
        ${isUser
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-800"
        }`}
    >
      {image && (
        <img src={image} alt="img" className="w-36 rounded mb-2" />
      )}
      {isTyping
        ? <span className="italic text-gray-400">กำลังพิมพ์...</span>
        : message}
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
        <ChatBubble
          key={idx}
          message={msg.text}
          isUser={msg.isUser}
          isTyping={msg.isTyping}
          image={msg.image}
        />
      ))}
      {isTyping && <ChatBubble isUser={false} isTyping={true} />}
      <div ref={bottomRef} />
    </div>
  );
};

// Chat Input (แนบภาพ + preview)
const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSend = async () => {
    if (input.trim() || image) {
      let imageBase64 = null;
      let imagePreview = null;
      if (image) {
        imageBase64 = await toBase64(image);
        imagePreview = URL.createObjectURL(image);
      }
      onSend(input, imageBase64, imagePreview); // ส่งทั้ง base64 (ไป backend) และ preview (โชว์หน้า user)
      setInput("");
      setImage(null);
      setPreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-white items-center">
      {/* ปุ่มแนบรูป */}
      <label className="cursor-pointer flex items-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
        <span className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition">
          📷
        </span>
      </label>
      {/* Preview Image */}
      {preview && (
        <img src={preview} alt="preview" className="w-10 h-10 rounded object-cover mx-1" />
      )}
      {/* ช่องข้อความ */}
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

  // รองรับทั้งข้อความ+รูป (image)
  const handleSend = async (text, imageBase64, imagePreview) => {
    if (imageBase64) {
      // แสดงรูปในแชทฝั่ง user
      setMessages((msgs) => [
        ...msgs,
        { text, isUser: true, image: imagePreview },
      ]);
    } else {
      setMessages((msgs) => [...msgs, { text, isUser: true }]);
    }
    setIsTyping(true);

    try {
      // เรียก API (ส่งข้อความ + base64 รูป)
      const res = await fetch("/api/farmer/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, image: imageBase64 }),
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
        ผู้เชี่ยวชาญด้านเกษตรดิจิทัล
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList messages={messages} isTyping={isTyping} />
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

export default ChatGPTPage;
