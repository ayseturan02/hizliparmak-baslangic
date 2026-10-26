"use client";
import { useState } from "react";
export default function CommunityActions({ targetType, targetId, username }: { targetType: "CHAT" | "QUESTION" | "ANSWER"; targetId: string; username: string }) {
 const [open,setOpen] = useState(false), [reason,setReason] = useState(""), [message,setMessage] = useState(""), [busy,setBusy] = useState(false);
 async function send(block = false) {
  setBusy(true); setMessage("");
  try { const response = await fetch("/api/community/" + (block ? "blocks" : "reports"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(block ? { username, blocked: true } : { targetType, targetId, reason }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessage(data.message); setOpen(false); if(block) window.location.reload(); }
  catch(e) { setMessage(e instanceof Error ? e.message : "İşlem tamamlanamadı."); } finally { setBusy(false); }
 }
 return <div className="community-tools"><button className="chat-action" type="button" onClick={()=>setOpen(!open)}>Şikâyet et</button><button className="chat-action" type="button" disabled={busy} onClick={()=>{if(window.confirm(`@${username} kullanıcısını engellemek istiyor musun? Sohbet, soru ve cevaplarda birbirinizin içeriklerini göremezsiniz.`)) void send(true);}}>Kullanıcıyı engelle</button>{open && <div className="community-report"><label>Şikâyet nedeni<textarea required minLength={5} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/></label><button className="button button-ghost" type="button" disabled={busy || reason.trim().length < 5} onClick={()=>void send()}>Şikâyeti gönder</button></div>}{message && <p role="status">{message}</p>}</div>;
}
