"use client";
import { useEffect, useState } from "react";
export default function BlockedUsers() {
 const [names,setNames]=useState<string[]>([]),[message,setMessage]=useState("");
 useEffect(()=>{fetch("/api/community/blocks",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setNames(d.blocks.map((b:{blocked:{username:string}})=>b.blocked.username));}).catch(e=>setMessage(e.message));},[]);
 async function unblock(username:string){try{const r=await fetch("/api/community/blocks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,blocked:false})});const d=await r.json();if(!r.ok)throw new Error(d.error);setNames(n=>n.filter(v=>v!==username));setMessage(d.message);}catch(e){setMessage(e instanceof Error?e.message:"İşlem tamamlanamadı.");}}
 return <div><h2>Engellediğin kullanıcılar</h2>{names.length?names.map(name=><p key={name}>@{name} <button type="button" className="button button-ghost" onClick={()=>void unblock(name)}>Engeli kaldır</button></p>):<p>Engellenmiş kullanıcı yok.</p>}{message&&<p role="status">{message}</p>}</div>;
}
