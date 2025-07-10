"use client";
import React from "react";

export default function Profile({ onInput, input, onSend, isRecording, onMic, disabled }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181A]">
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo-thailand-fruit.png" // ใส่ logo หรือ path ที่ต้องการ
          alt="Bigboss"
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
          Bigboss
        </h1>
        <span className="text-blue-300 text-sm mb-2">
          By Surasit Preasrisi
        </span>
        <div className="text-center max-w-md text-gray-300 text-base font-medium leading-relaxed">
          Full Stack Developer (Next.js, React, API, DB, DevOps)<br />
          UX/UI Designer (Wireframe, Modern UI, Prototyping, Accessibility)
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-md mt-12 px-4">
        <div className="bg-[#232324] rounded-2xl px-6 py-4 flex items-center shadow-xl">
          <input
            type="text"
            value={input}
            onChange={e => onInput(e.target.value)}
            placeholder="Ask anything"
            className="flex-1 bg-transparent text-white outline-none border-0 placeholder:text-gray-400 text-lg"
            onKeyDown={e => e.key === "Enter" && onSend()}
            disabled={disabled}
            autoFocus
          />
          <button
            onClick={onMic}
            type="button"
            className={`ml-3 transition-all p-2 rounded-full bg-blue-600 hover:bg-blue-700 ${isRecording ? "animate-pulse" : ""}`}
            disabled={disabled}
            title="พูดแล้วพิมพ์"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 17c1.933 0 3.5-1.627 3.5-3.5V8.5c0-1.933-1.627-3.5-3.5-3.5S8.5 6.567 8.5 8.5v5c0 1.933 1.627 3.5 3.5 3.5Zm5-3.5a1 1 0 1 0-2 0A5 5 0 0 1 7 13.5a1 1 0 1 0-2 0c0 3.07 2.443 5.525 5.5 5.954V22a1 1 0 1 0 2 0v-2.546c3.057-.43 5.5-2.884 5.5-5.954Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center text-gray-600 text-xs tracking-wide">
        Powered by Next.js, Tailwind, OpenAI | Bigboss 2024
      </div>
    </div>
  );
}
