"use client";
import { useState } from "react";
export default function ModerationControls({ reportId }: { reportId: string }) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function act(action:string) {
  if(!window.confirm(action === "REMOVE" ? "İçerik kalıcı olarak kaldırılsın mı? Soru silinirse cevapları da silinir." : action === "SUSPEND" ? "Kullanıcının topluluğa yazması durdurulsun mu?" : "Şikâyet işlem yapılmadan kapatılsın mı?")) return;
  setBusy(true);try{const r=await fetch("/api/admin/moderation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportId,action})});const d=await r.json();if(!r.ok)throw new Error(d.error);window.location.reload();}catch(e){setMessage(e instanceof Error?e.message:"İşlem tamamlanamadı.");}finally{setBusy(false);}
 }
 return <div className="community-tools"><button className="button button-ghost" disabled={busy} onClick={()=>void act("DISMISS")}>İşlem yapmadan kapat</button><button className="button button-ghost" disabled={busy} onClick={()=>void act("REMOVE")}>İçeriği kaldır</button><button className="button button-ghost" disabled={busy} onClick={()=>void act("SUSPEND")}>Yazarı askıya al</button>{message&&<p role="alert">{message}</p>}</div>;
}
