import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import MobileNav from "@/components/MobileNav";

export default async function SiteHeader() {
  const user = await getSessionUser();
  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="HızlıParmak ana sayfa">
        <span className="brand-mark"><span>H</span><i>✦</i></span>
        <span className="brand-word">hızlı<span className="brand-accent">parmak</span><small>KLAVYE PERFORMANS AKADEMİSİ</small></span>
      </Link>
      <nav className="nav-links" aria-label="Ana gezinme">
        <Link href="/ogren">Akademi</Link><Link href="/test">Hız testi</Link><Link href="/yarislar">3/5 dk yarış</Link><Link href="/genel-metinler">Metinler</Link><Link href="/sohbet">Sohbet</Link><Link href="/liderlik">Sıralama</Link><Link href="/duyurular">Duyurular</Link>
      </nav>
      <div className="header-actions">
        {user ? <>
          <Link className="button button-ghost header-dashboard" href="/dashboard">Panelim <span>↗</span></Link>
          <span className="user-chip"><i />{user.username}</span>
          <form action="/api/auth/logout" method="post"><button className="button button-logout" type="submit"><span className="logout-icon">↗</span> Çıkış yap</button></form>
        </> : <>
          <Link className="button button-ghost header-login" href="/giris">Giriş yap</Link>
          <Link className="button button-primary" href="/kayit">Ücretsiz başla <span>↗</span></Link>
        </>}
      </div>
      <MobileNav />
    </div>
  </header>;
}
