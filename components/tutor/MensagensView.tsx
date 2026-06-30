"use client";

import { useState } from "react";
import { ImagePlus, Paperclip, PawPrint, Send } from "lucide-react";
import type { Message } from "@/lib/tutor-demo";

export function MensagensView({ messages: seed, quickReplies }: { messages: Message[]; quickReplies: string[] }) {
  const [list, setList] = useState<Message[]>(seed);
  const [text, setText] = useState("");

  function send(value: string) {
    const content = value.trim();
    if (!content) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setList((prev) => [...prev, { id: prev.length + 1, from: "tutor", author: "Voce", text: content, time }]);
    setText("");
  }

  return (
    <div className="tutor-page">
      <section className="tutor-section tutor-chat-section">
        <div className="tutor-chat-head">
          <div className="tutor-chat-avatar"><PawPrint size={20} /></div>
          <div>
            <strong>Equipe Scolt &amp; Cia</strong>
            <small><span className="dot-pulse" /> Online · conversa sobre o seu pet</small>
          </div>
        </div>

        <div className="tutor-chat-body">
          {list.map((m) => (
            <div key={m.id} className={`tutor-bubble-row ${m.from}`}>
              <div className="tutor-bubble">
                {m.from === "team" ? <span className="tutor-bubble-author">{m.author}</span> : null}
                <p>{m.text}</p>
                <small>{m.time}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="tutor-quick-replies">
          {quickReplies.map((q) => (
            <button key={q} onClick={() => send(q)}>{q}</button>
          ))}
        </div>

        <form className="tutor-chat-input" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <button type="button" className="tutor-chat-icon" aria-label="Anexar arquivo"><Paperclip size={18} /></button>
          <button type="button" className="tutor-chat-icon" aria-label="Enviar imagem"><ImagePlus size={18} /></button>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem..." />
          <button type="submit" className="tutor-chat-send" aria-label="Enviar"><Send size={18} /></button>
        </form>
      </section>
    </div>
  );
}
