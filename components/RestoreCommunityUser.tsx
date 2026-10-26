"use client";
import { useState } from "react";
export default function RestoreCommunityUser({userId}:{userId:string}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function restore(){if(!window.confirm("Kullanıcının topluluk erişimi yeniden açılsın mı?"))return;setBusy(true);try{const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,action:"RESTORE"})});if(!r.ok)throw new Error("İşlem tamamlanamadı.");window.location.reload();}catch(e){setError(e instanceof Error?e.message:"İşlem tamamlanamadı.");}finally{setBusy(false);}}
 return <><button type="button" disabled={busy} className="button button-ghost" onClick={()=>void restore()}>Topluluk askısını kaldır</button>{error&&<span role="alert">{error}</span>}</>;
}
