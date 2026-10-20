"use client";
import { useState } from "react";

export default function CheckoutForm({ planCode }: { planCode: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/payments/iyzico/initialize", { method: "POST", body: JSON.stringify({
        planCode,
        name: formData.get("name"), surname: formData.get("surname"), phone: formData.get("phone"),
        identityNumber: formData.get("identityNumber"), address: formData.get("address"), city: formData.get("city"),
      }), headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok || !data.paymentPageUrl) throw new Error(data.error || "Ödeme sayfası başlatılamadı.");
      window.location.assign(data.paymentPageUrl);
    } catch (e) { setError(e instanceof Error ? e.message : "Beklenmeyen hata oluştu."); setLoading(false); }
  }
  return <form className="form-card" onSubmit={async (event) => { event.preventDefault(); await submit(new FormData(event.currentTarget)); }}>
    <h2>Fatura ve ödeme bilgileri</h2>
    <p className="muted">Kart bilgileri HızlıParmak'a girilmez; ödeme sağlayıcısının güvenli sayfasında alınır.</p>
    <label htmlFor="name">Ad</label><input id="name" name="name" required maxLength={50} autoComplete="given-name" />
    <label htmlFor="surname">Soyad</label><input id="surname" name="surname" required maxLength={50} autoComplete="family-name" />
    <label htmlFor="phone">Telefon</label><input id="phone" name="phone" required type="tel" placeholder="+905xxxxxxxxx" autoComplete="tel" />
    <label htmlFor="identityNumber">T.C. kimlik numarası</label><input id="identityNumber" name="identityNumber" required inputMode="numeric" pattern="[0-9]{11}" minLength={11} maxLength={11} aria-describedby="identity-help" /><small id="identity-help">Ödeme sağlayıcısının zorunlu alanıdır; yalnızca ödeme başlatılırken kullanılır.</small>
    <label htmlFor="address">Fatura adresi</label><input id="address" name="address" required maxLength={200} autoComplete="street-address" />
    <label htmlFor="city">İl</label><input id="city" name="city" required maxLength={50} autoComplete="address-level2" />
    {error && <p className="notice notice-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={loading}>{loading ? "Ödeme hazırlanıyor…" : "Güvenli ödemeye geç"}</button>
  </form>;
}
