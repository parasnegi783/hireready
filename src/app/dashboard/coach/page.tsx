"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSend,
  IconSparkles,
  IconUser,
  IconLoader2,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Why is my resume summary weak?",
  "Rewrite my experience section",
  "What skills should I learn first?",
  "How do I improve my ATS score?",
  "Write a better professional summary",
  "Tips for my specific role",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "Sorry, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          AI <span className="gradient-text">Career Coach</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Ask anything about your resume, skills, or career path.
        </p>
      </motion.div>

      {/* Messages */}
      <div className="mt-6 flex-1 overflow-y-auto rounded-2xl border border-white/[0.04] bg-[#0d0d14] p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
              <IconSparkles size={28} className="text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Hi! I&apos;m your AI Career Coach
            </h3>
            <p className="mt-2 max-w-sm text-sm font-light text-slate-500">
              Ask me about your resume, skills, interview prep, or career
              strategy. I&apos;m here to help you get hire-ready.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-xs font-light text-slate-400 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-cyan-500"
                      : "bg-purple-500/10"
                  }`}
                >
                  {msg.role === "user" ? (
                    <IconUser size={14} className="text-white" />
                  ) : (
                    <IconSparkles size={14} className="text-purple-400" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-purple-600/20 border border-purple-500/20"
                      : "bg-[#111118] border border-white/[0.06]"
                  }`}
                >
                  <div className="prose prose-sm prose-invert max-w-none text-sm font-light leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                    <IconSparkles size={14} className="text-purple-400" />
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#111118] px-4 py-3">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-purple-400/50"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#111118] px-4 py-3 transition-all focus-within:border-purple-500/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask anything about your career..."
            className="flex-1 bg-transparent text-sm font-light text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(124,58,237,0.3)] disabled:opacity-50"
        >
          {loading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSend size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
