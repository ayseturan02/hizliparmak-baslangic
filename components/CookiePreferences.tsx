"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const KEY = "hp-cookie-notice-v1";
export default function CookiePreferences() {
 const [open, setOpen] = useState(false);
 useEffect(() => {
  try {
   // The former advertising preference no longer controls advertising delivery.
   window.localStorage.removeItem("hp-cookie-consent-v1");
   const saved = Number(window.localStorage.getItem(KEY));
   setOpen(!saved || saved > Date.now() || Date.now() - saved > 365 * 86400000);
  } catch { setOpen(true); }
 }, []);
 function close() { try { window.localStorage.setItem(KEY, String(Date.now())); } catch {} setOpen(false); }
 return <><button type="button" className="chat-action" onClick={() => setOpen(true)}>Çerez bilgileri</button>{open && <section aria-label="Çerez bilgileri" className="cookie-preferences"><h2>Çerezler hakkında</h2><p>Oturum çerezleri giriş yapmanı sağlar. Bu site Google AdSense reklam kodunu otomatik yükler; reklam hizmeti çerez ve cihaz verileri kullanabilir. Çerezleri tarayıcı ayarlarından yönetebilirsin. <Link href="/cerez-politikasi">Ayrıntılar</Link></p><button type="button" className="button button-primary" onClick={close}>Bilgiyi kapat</button></section>}</>;
}
