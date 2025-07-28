"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// ===== ActionButton capsule =====
function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      className={`flex flex-col items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm min-w-[110px] min-h-[48px] px-3 py-2 mx-2 my-2 hover:shadow-md active:scale-95 transition ${color}`}
      onClick={onClick}
      style={{ fontSize: 15 }}
      type="button"
    >
      <span className={`mb-0.5 text-xl`}>{icon}</span>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

// ===== Modal ขยายรูป =====
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

// ===== ฟอร์แมตข้อความบอท (อ่านง่าย, มี bullet, หัวข้อ) =====
function formatBotReply(text, textSize = 15) {
  if (!text) return null;
  return (
    <div
      className="whitespace-pre-line leading-relaxed break-words"
      style={{ fontSize: textSize, wordBreak: "keep-all", lineBreak: "strict" }}
    >
      {text.split("\n").map((t, i) => {
        t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
        if (/^\d+\./.test(t) || /^- /.test(t) || /^• /.test(t))
          return <div key={i} className="pl-1 mt-1" dangerouslySetInnerHTML={{ __html: t }} />;
        if (/^โรครุเรียน|ปัญหา|วิธีแก้|หมายเหตุ/.test(t))
          return <div key={i} className="font-bold text-base mt-3">{t}</div>;
        return <div key={i} dangerouslySetInnerHTML={{ __html: t }} />;
      })}
    </div>
  );
}

// ===== Typing Animation Bubble (framer-motion) =====
function TypingBubble({ textSize = 15 }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-2xl w-fit shadow"
      initial={{ opacity: 0.5, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ fontSize: textSize }}
    >
      <span className="text-gray-400">กำลังค้นตำราวิชาการเกษตรให้ครับ</span>
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="dot"
        style={{ fontSize: 32, lineHeight: "1" }}
      >
        ...
      </motion.span>
    </motion.div>
  );
}

// ===== Chat bubble รองรับหลายรูป & Typing bubble =====
const ChatBubble = ({ message, isUser, images, isTyping, onImageClick, textSize }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1 sm:my-2 px-1`}>
      <div
        className={`
          rounded-2xl px-3 py-2
          max-w-[90vw] sm:max-w-md
          shadow break-all
          ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}
          ${isUser ? "rounded-br-md" : "rounded-bl-md"}
          w-fit relative
        `}
      >
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="img"
                className="w-24 h-auto max-w-full rounded cursor-pointer hover:scale-105 transition border"
                onClick={() => onImageClick?.(img)}
                title="คลิกเพื่อดูภาพใหญ่"
                style={{ maxHeight: 90 }}
              />
            ))}
          </div>
        )}
        {isTyping ? (
          <TypingBubble textSize={textSize} />
        ) : isUser
          ? <span className="whitespace-pre-line" style={{ fontSize: textSize }}>{message}</span>
          : formatBotReply(message, textSize)}
      </div>
    </div>
  );
};

// ===== Chat list =====
function ChatMessageList({ messages, isTyping, onImageClick, textSize }) {
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
          images={msg.images}
          isTyping={msg.isTyping}
          onImageClick={onImageClick}
          textSize={textSize}
        />
      ))}
      {isTyping && <ChatBubble isUser={false} isTyping={true} textSize={textSize} />}
      <div ref={bottomRef} />
    </div>
  );
}

// toBase64 (helper)
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ===== InputBar รองรับแนบ “หลายรูป” =====
function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]); // [{file, preview}]
  const [isRecording, setIsRecording] = useState(false);
  const [rows, setRows] = useState(1);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.rows = 1;
      const maxRows = 8;
      const calcRows = Math.min(
        maxRows,
        Math.max(1, Math.ceil(textarea.scrollHeight / 28))
      );
      setRows(calcRows);
      textarea.rows = calcRows;
    }
  }, [input]);

  // Speech Recognition
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

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (items) {
      let newImages = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          newImages.push({ file, preview: URL.createObjectURL(file) });
          e.preventDefault();
        }
      }
      if (newImages.length) setImages(imgs => [...imgs, ...newImages]);
    }
  }
  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length) {
      setImages(imgs =>
        [...imgs, ...imageFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]
      );
    }
  }
  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length) {
      setImages(imgs =>
        [...imgs, ...imageFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]
      );
    }
  }
  function handleRemoveImage(idx) {
    setImages(imgs => imgs.filter((_, i) => i !== idx));
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
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  async function handleSend() {
    if (!input.trim() && images.length === 0) return;
      const imageBase64s = await Promise.all(
        images.map(async img => {
          const type = img.file.type && img.file.type.startsWith("image/") ? img.file.type : "image/jpeg";
          return {
            base64: await toBase64(img.file),
            mime: type,
            preview: img.preview,
          };
        })
      );
    onSend(input, imageBase64s, images.map(img => img.preview));
    setInput("");
    setImages([]);
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-10 bg-white border-t px-3 py-2"
      style={{ minHeight: 64 }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Preview รูปเรียงเป็นแถว ด้านบน input */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-fit">
              <img src={img.preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border" />
              <button onClick={() => handleRemoveImage(idx)}
                className="absolute -top-1 -right-1 bg-white rounded-full border text-xs px-1">✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end bg-[#f5f5f5] rounded-2xl px-2 py-2 min-h-[44px] border border-gray-200">
        <textarea
          ref={textareaRef}
          rows={rows}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-gray-900 text-base placeholder:text-gray-400 px-1 py-1"
          style={{ minHeight: 32, maxHeight: 224 }}
          placeholder="AI พร้อมช่วยคุณเรื่องเกษตร พิมพ์มาเลยครับ"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {/* แนบรูป/ถ่าย/ไมค์/ส่ง */}
        <button onClick={() => document.getElementById("fileInputGallery").click()} className="text-gray-400 hover:text-blue-500 ml-1" title="แนบรูป" tabIndex={-1}>
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M3 19L9.54 12.46M9.5 9A2.5 2.5 0 1 0 9.5 4a2.5 2.5 0 0 0 0 5Zm9.5 9l-4-4a3 3 0 1 0-4.5-4.5l-4 4 8.5 8.5Z" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <input type="file" accept="image/*" multiple id="fileInputGallery" className="hidden" onChange={handleImageChange} />
        <button onClick={() => document.getElementById("fileInputCamera").click()} className="text-gray-400 hover:text-green-500 ml-1" title="ถ่ายภาพ" tabIndex={-1}>
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="4" y="7" width="14" height="11" rx="3" stroke="#22c55e" strokeWidth="1.6"/><circle cx="11" cy="13" r="3" stroke="#22c55e" strokeWidth="1.6"/></svg>
        </button>
        <input type="file" accept="image/*" capture="environment" multiple id="fileInputCamera" className="hidden" onChange={handleImageChange} />
        <button className={`ml-1 text-gray-400 hover:text-blue-600 transition ${isRecording ? "animate-pulse text-green-500" : ""}`} title="ไมค์" onClick={handleMic} tabIndex={-1} disabled={disabled}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 17c1.933 0 3.5-1.627 3.5-3.5V8.5c0-1.933-1.627-3.5-3.5-3.5S8.5 6.567 8.5 8.5v5c0 1.933 1.627 3.5 3.5 3.5Zm5-3.5a1 1 0 1 0-2 0A5 5 0 0 1 7 13.5a1 1 0 1 0-2 0c0 3.07 2.443 5.525 5.5 5.954V22a1 1 0 1 0 2 0v-2.546c3.057-.43 5.5-2.884 5.5-5.954Z" fill="currentColor"/></svg>
        </button>
        <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 disabled:opacity-50 min-w-[44px] min-h-[36px] text-base"
          onClick={handleSend}
          disabled={disabled || (!input.trim() && images.length === 0)}
          style={{ minHeight: 36 }}>
          ส่ง
        </button>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT (Default export) =====
export default function ChatGPTPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [textSize, setTextSize] = useState(15);

  // ส่งข้อมูล (รองรับหลายไฟล์ + context)
  async function handleSend(input, imageBase64s, previews) {
    const nextMessages = [
      ...messages,
      { text: input, isUser: true, images: previews }
    ];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/farmer/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: nextMessages.map(m => ({
            role: m.isUser ? "user" : "assistant",
            content: m.text,
            images: m.images || [],
          }))
        }),
      });
      const data = await res.json();
      let i = 0;
      setMessages(msgs => [...msgs, { text: "", isUser: false }]);
      function reveal() {
        setMessages(msgs => [
          ...msgs.slice(0, -1),
          { text: data.reply.slice(0, i), isUser: false }
        ]);
        i++;
        if (i <= data.reply.length) {
          setTimeout(reveal, 13);
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

  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-dvh min-h-screen bg-gray-50 w-full max-w-full mx-auto">
      {/* Top Bar */}
      <div className="flex gap-1 fixed top-0 left-0 w-full bg-white z-30 px-3 pt-2 pb-2 border-b shadow-sm items-center" style={{ minHeight: 48 }}>
        <span className="mr-2">
          <svg width="22" height="22" fill="none"><rect width="18" height="2" x="3" y="5" fill="#444"/><rect width="13" height="2" x="3" y="10" fill="#444"/><rect width="18" height="2" x="3" y="15" fill="#444"/></svg>
        </span>
        <span className="font-semibold text-base flex-1">ผู้ช่วยเกษตรอัจฉริยะ</span>
        <button onClick={() => setTextSize(s => Math.max(12, s - 1))} className="text-sm px-2">A−</button>
        <button onClick={() => setTextSize(s => Math.min(28, s + 1))} className="text-sm px-2">A+</button>
      </div>
      {/* Welcome */}
      {isChatEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 w-full pt-24 absolute left-0 top-0 z-10 h-full bg-gray-50">
          <div className="flex flex-col items-center pt-10 pb-6">
            <img
              src="/logo.jpg"
              alt="Bigboss Avatar"
              className="w-20 h-20 rounded-full shadow-xl border-4 border-white mb-3 object-cover"
            />
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-1 mt-2">ผู้ช่วยอัจฉริยะด้านการเกษตร ยินดีให้บริการครับ</h2>
          </div>
        </div>
      )}
      {/* Chat */}
      {!isChatEmpty && (
        <div className="flex-1 overflow-y-auto max-h-[calc(100dvh-120px)] mt-10 pt-2">
          <ChatMessageList messages={messages} isTyping={isTyping} onImageClick={setModalImg} textSize={textSize} />
        </div>
      )}
      <InputBar onSend={handleSend} disabled={isTyping} />
      <ImageModal src={modalImg} alt="preview" onClose={() => setModalImg(null)} />
    </div>
  );
}
