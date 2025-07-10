"use client";
import React, { useRef, useState, useEffect } from "react";

// ActionButton ปุ่ม capsule
function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center
        rounded-full border border-gray-200
        bg-white shadow-sm
        min-w-[110px] min-h-[48px]
        px-3 py-2
        mx-2 my-2
        hover:shadow-md active:scale-95
        transition
      `}
      onClick={onClick}
      style={{ fontSize: 15 }}
    >
      <span className={`mb-0.5 text-xl ${color}`}>{icon}</span>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

// แปลง file เป็น base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// รูป modal ขยาย
function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed z-50 inset-0 bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-[98vw] px-2">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[60vh] md:max-h-[80vh] rounded-xl shadow-2xl border-4 border-white mx-auto"
        />
        <div className="flex justify-end mt-3 gap-2">
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-3 py-1 rounded shadow text-sm"
          >
            ดาวน์โหลดภาพ
          </a>
          <button
            onClick={onClose}
            className="bg-white text-gray-800 px-3 py-1 rounded shadow text-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

// ฟอร์แมตข้อความฝั่งบอท (ใส่เลข, เว้นบรรทัด, bold ฯลฯ)
function formatBotReply(text) {
  if (!text) return null;
  // 1. เปลี่ยน "**หัวข้อ**:" เป็น <b>
  // 2. เว้นบรรทัดหลังเลข/หัวข้อ
  // 3. Bullet หรือ "ได้แก่:" ขึ้นบรรทัดใหม่
  return text.split("\n").map((t, i) => {
    // เปลี่ยน "**....**:" เป็น <b>
    t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    if (/^\d+\.\s*<b>/.test(t)) return <div key={i} className="mt-2" dangerouslySetInnerHTML={{ __html: t }} />;
    if (/^(\*{1,2}|- )/.test(t)) return <div key={i} dangerouslySetInnerHTML={{ __html: t }} />;
    if (/^(\s)*(ได้แก่|ตัวอย่างเช่น)/.test(t)) return <div key={i} className="mt-2">{t}</div>;
    return <div key={i} dangerouslySetInnerHTML={{ __html: t }} />;
  });
}

// Chat bubble
const ChatBubble = ({ message, isUser, image, isTyping, onImageClick }) => (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1 sm:my-2 px-1`}>
    <div
      className={`
        rounded-2xl px-3 py-2
        max-w-[90vw] sm:max-w-md
        shadow break-all
        ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}
        ${isUser ? "rounded-br-md" : "rounded-bl-md"}
        text-[15px] sm:text-base
        w-fit
      `}
    >
      {image && (
        <img
          src={image}
          alt="img"
          className="w-32 h-auto max-w-full rounded mb-1 cursor-pointer hover:scale-105 transition"
          onClick={() => onImageClick?.(image)}
          title="คลิกเพื่อดูภาพใหญ่"
        />
      )}
      {isTyping ? (
        <span className="italic text-gray-400">กำลังพิมพ์...</span>
      ) : (
        isUser ? message : formatBotReply(message)
      )}
    </div>
  </div>
);

// แสดงรายการข้อความแชท
function ChatMessageList({ messages, isTyping, onImageClick }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  return (
    <div className="flex flex-col gap-1 sm:gap-2 overflow-y-auto flex-1 px-0 py-2 sm:px-2 sm:py-2 scrollbar-none">
      {messages.map((msg, idx) => (
        <ChatBubble
          key={idx}
          message={msg.text}
          isUser={msg.isUser}
          image={msg.image}
          isTyping={msg.isTyping}
          onImageClick={onImageClick}
        />
      ))}
      {isTyping && <ChatBubble isUser={false} isTyping={true} />}
      <div ref={bottomRef} />
    </div>
  );
}

// InputBar รองรับวาง/แนบ/ถ่าย/drag-drop/voice
function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Voice to Text
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

  // วางภาพ (Ctrl+V)
  function handlePaste(e) {
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
  }
  // Drag&Drop
  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }
  function handleMic() {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  }
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }
  function handleRemoveImage() {
    setImage(null);
    setPreview(null);
  }
  function handleSend() {
    if (!input.trim() && !image) return;
    onSend(input, image, preview);
    setInput("");
    setImage(null);
    setPreview(null);
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-10 bg-white border-t flex items-center px-3 py-2"
      style={{ minHeight: 56 }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <button onClick={() => document.getElementById("fileInputGallery").click()} className="text-gray-400 hover:text-blue-500 mr-1" title="แนบรูป">
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M3 19L9.54 12.46M9.5 9A2.5 2.5 0 1 0 9.5 4a2.5 2.5 0 0 0 0 5Zm9.5 9l-4-4a3 3 0 1 0-4.5-4.5l-4 4 8.5 8.5Z" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <input type="file" accept="image/*" id="fileInputGallery" className="hidden" onChange={handleImageChange} />
      <button onClick={() => document.getElementById("fileInputCamera").click()} className="text-gray-400 hover:text-green-500 mr-1" title="ถ่ายภาพ">
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="4" y="7" width="14" height="11" rx="3" stroke="#22c55e" strokeWidth="1.6"/><circle cx="11" cy="13" r="3" stroke="#22c55e" strokeWidth="1.6"/></svg>
      </button>
      <input type="file" accept="image/*" capture="environment" id="fileInputCamera" className="hidden" onChange={handleImageChange} />
      {preview && (
        <div className="relative mx-1">
          <img src={preview} alt="preview" className="w-9 h-9 rounded object-cover" />
          <button onClick={handleRemoveImage} className="absolute -top-1 -right-1 bg-white rounded-full border text-xs px-1">✕</button>
        </div>
      )}
      <input
        className="flex-1 border-0 outline-none text-gray-900 text-base bg-transparent placeholder:text-gray-400 px-2"
        style={{ minHeight: 36 }}
        placeholder="ถามอะไรได้ให้..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        disabled={disabled}
      />
      <button className={`ml-2 text-gray-400 hover:text-blue-600 transition p-1 ${isRecording ? "animate-pulse text-green-500" : ""}`} title="ไมค์" onClick={handleMic} disabled={disabled}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 17c1.933 0 3.5-1.627 3.5-3.5V8.5c0-1.933-1.627-3.5-3.5-3.5S8.5 6.567 8.5 8.5v5c0 1.933 1.627 3.5 3.5 3.5Zm5-3.5a1 1 0 1 0-2 0A5 5 0 0 1 7 13.5a1 1 0 1 0-2 0c0 3.07 2.443 5.525 5.5 5.954V22a1 1 0 1 0 2 0v-2.546c3.057-.43 5.5-2.884 5.5-5.954Z" fill="currentColor"/></svg>
      </button>
      <button className="ml-2 bg-blue-500 text-white px-4 py-1 rounded-full shadow hover:bg-blue-600 disabled:opacity-50 min-w-[44px] min-h-[36px] text-base"
        onClick={handleSend}
        disabled={disabled || (!input.trim() && !image)}
        style={{ minHeight: 36 }}>
        ส่ง
      </button>
    </div>
  );
}

// Main
export default function ChatGPTPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [modalImg, setModalImg] = useState(null);

  // action ตัวอย่าง (เพิ่มเองตาม usecase)
  const actions = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 19L9.54 12.46M9.5 9A2.5 2.5 0 1 0 9.5 4a2.5 2.5 0 0 0 0 5Zm9.5 9l-4-4a3 3 0 1 0-4.5-4.5l-4 4 8.5 8.5Z" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      label: "สร้างภาพ",
      color: "text-green-500",
      onClick: () => setMessages(msgs => [...msgs, { text: "สร้างภาพ (Demo)", isUser: true }])
    },
    {
      icon: <svg width="22" height="22" fill="none"><rect width="16" height="18" x="3" y="3" rx="3" stroke="#ea580c" strokeWidth="1.6"/><path d="M7 8h6M7 12h2" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round"/></svg>,
      label: "สรุปข้อความ",
      color: "text-orange-500",
      onClick: () => setMessages(msgs => [...msgs, { text: "สรุปข้อความ (Demo)", isUser: true }])
    },
    // เพิ่มปุ่มอื่นๆ ได้
  ];

  // "กำลังพิมพ์..." & Typing effect
  async function handleSend(input, image, preview) {
    setMessages(msgs => [
      ...msgs,
      { text: input, isUser: true, image: preview }
    ]);
    setIsTyping(true);

    let imageBase64 = null;
    let mime = null;
    if (image) {
      imageBase64 = await toBase64(image);
      mime = image.type;
    }

    try {
      const res = await fetch("/api/farmer/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, image: imageBase64, mime }),
      });
      const data = await res.json();
      const reply = data.reply || "ขออภัย เกิดข้อผิดพลาด";
      // Typing effect
      let i = 0;
      setMessages(msgs => [...msgs, { text: "", isUser: false }]);
      function reveal() {
        setMessages(msgs => [
          ...msgs.slice(0, -1),
          { text: reply.slice(0, i), isUser: false }
        ]);
        i++;
        if (i <= reply.length) {
          setTimeout(reveal, 13); // ปรับ speed ได้
        } else {
          setIsTyping(false);
        }
      }
      reveal();
    } catch {
      setMessages(msgs => [
        ...msgs,
        { text: "ขออภัย ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", isUser: false }
      ]);
      setIsTyping(false);
    }
  }

  // Welcome
  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-dvh min-h-screen bg-gray-50 w-full max-w-full mx-auto">
      {/* Top Bar */}
      <div className="flex items-center w-full mb-5 px-3 pt-3 pb-2 border-b bg-white shadow-sm fixed top-0 left-0 z-20" style={{ minHeight: 48 }}>
        <span className="mr-2">
          <svg width="22" height="22" fill="none"><rect width="18" height="2" x="3" y="5" fill="#444"/><rect width="13" height="2" x="3" y="10" fill="#444"/><rect width="18" height="2" x="3" y="15" fill="#444"/></svg>
        </span>
        <span className="font-semibold text-base flex-1">ผู้เชี่ยวชาญด้านการเกษตร</span>
      </div>
      {/* Welcome (กลางจอ) */}
      {isChatEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 w-full pt-24 absolute left-0 top-0 z-10 h-full bg-gray-50">
          <h2 className="text-lg sm:text-xl font-semibold text-center mb-4 mt-8">มีอะไรให้ฉันช่วยหรือ</h2>
          <div className="flex flex-wrap justify-center items-center w-full max-w-xs sm:max-w-sm">
            {actions.map((a, i) => (
              <ActionButton key={i} {...a} />
            ))}
          </div>
        </div>
      )}
      {/* Chat Message List (ซ่อนถ้ายังไม่มีแชท) */}
      {!isChatEmpty && (
        <div className="flex-1 overflow-y-auto max-h-[calc(100dvh-120px)] mt-10 pt-2">
          <ChatMessageList messages={messages} isTyping={isTyping} onImageClick={setModalImg} />
        </div>
      )}
      <InputBar onSend={handleSend} disabled={isTyping} />
      <ImageModal src={modalImg} alt="preview" onClose={() => setModalImg(null)} />
    </div>
  );
}
