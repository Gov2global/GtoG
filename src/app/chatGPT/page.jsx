"use client";
import React, { useState, useRef, useEffect } from "react";

// Helper: แปลง file เป็น base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Chat Bubble (ข้อความ + รูป)
const ChatBubble = ({ message, isUser, isTyping, image }) => (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
    <div
      className={`rounded-2xl px-4 py-2 max-w-xs shadow break-words
        ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}
      `}
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

// Chat Input แบบมีปุ่ม +
const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Speech to Text
  const recognitionRef = useRef(null);
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "th-TH";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + text : text));
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const handleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Show/Hide Popup +
  const handlePlusClick = () => setShowPlusMenu((v) => !v);
  // เลือกภาพ
  const handleAttachFile = () => {
    setShowPlusMenu(false);
    document.getElementById("fileInputGallery")?.click();
  };
  // ถ่ายภาพ
  const handleTakePhoto = () => {
    setShowPlusMenu(false);
    document.getElementById("fileInputCamera")?.click();
  };

  // Paste image (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          setImage(file);
          setPreview(URL.createObjectURL(file));
          e.preventDefault();
        }
      }
    }
  };

  // Drag & Drop image
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // เมื่อเลือก/ถ่ายรูป
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async () => {
    if (input.trim() || image) {
      let imageBase64 = null;
      let imagePreview = null;
      if (image) {
        imageBase64 = await toBase64(image);
        imagePreview = URL.createObjectURL(image);
      }
      onSend(input, imageBase64, imagePreview);
      setInput("");
      setImage(null);
      setPreview(null);
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div
      className="relative flex gap-2 p-4 border-t bg-[#161618] items-center"
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ boxShadow: "0 -2px 32px 0 rgba(0,0,0,0.10)" }}
    >
      {/* ปุ่ม + (Plus) */}
      <div className="relative">
        <button
          onClick={handlePlusClick}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center bg-[#232324] rounded-full text-2xl text-white hover:bg-[#363638] transition"
          title="แนบไฟล์หรือถ่ายภาพ"
        >+</button>
        {showPlusMenu && (
          <div className="absolute left-0 bottom-12 z-20 bg-[#232324] rounded-xl shadow-lg py-1 min-w-[140px]">
            <button
              onClick={handleAttachFile}
              className="block w-full text-left px-4 py-2 hover:bg-[#333] text-white"
            >เลือกภาพจากเครื่อง</button>
            <button
              onClick={handleTakePhoto}
              className="block w-full text-left px-4 py-2 hover:bg-[#333] text-white"
            >ถ่ายภาพ</button>
          </div>
        )}
        {/* Input File Hidden */}
        <input
          type="file"
          accept="image/*"
          id="fileInputGallery"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          id="fileInputCamera"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
      </div>
      {/* Preview Image (โชว์ใน prompt) */}
      {preview && (
        <div className="relative mx-1">
          <img src={preview} alt="preview" className="w-10 h-10 rounded object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 bg-white rounded-full border text-xs px-1"
            title="ลบ"
          >✕</button>
        </div>
      )}
      {/* ช่องข้อความ + ปุ่มไมค์ */}
      <div className="flex flex-1 items-center bg-[#232324] rounded-2xl px-4 py-3">
        <input
          className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-gray-400"
          style={{ fontSize: 16, minHeight: 28 }}
          placeholder="พิมพ์ข้อความ, วางภาพ, ลากรูป, หรือกดไมค์พูด..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={disabled}
        />
        {/* ปุ่มไมค์ */}
        <button
          type="button"
          onClick={handleMic}
          disabled={disabled}
          className={`ml-2 transition ${isRecording ? "animate-pulse text-green-400" : "text-gray-400 hover:text-white"}`}
          title="พูดแล้วพิมพ์"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 17c1.933 0 3.5-1.627 3.5-3.5V8.5c0-1.933-1.627-3.5-3.5-3.5S8.5 6.567 8.5 8.5v5c0 1.933 1.627 3.5 3.5 3.5Zm5-3.5a1 1 0 1 0-2 0A5 5 0 0 1 7 13.5a1 1 0 1 0-2 0c0 3.07 2.443 5.525 5.5 5.954V22a1 1 0 1 0 2 0v-2.546c3.057-.43 5.5-2.884 5.5-5.954Z" fill="currentColor"/></svg>
        </button>
      </div>
      <button
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-600 disabled:opacity-50"
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

  // รองรับทั้งข้อความ+รูป
  const handleSend = async (text, imageBase64, imagePreview) => {
    if (imageBase64) {
      setMessages((msgs) => [
        ...msgs,
        { text, isUser: true, image: imagePreview },
      ]);
    } else {
      setMessages((msgs) => [...msgs, { text, isUser: true }]);
    }
    setIsTyping(true);

    try {
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
          setTimeout(reveal, 18);
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
