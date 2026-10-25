"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const passwordChecks = {
    length: password.length >= 10,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passwordValid =
    passwordChecks.length &&
    passwordChecks.letter &&
    passwordChecks.number &&
    password.length <= 128;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setError("");

    if (!passwordValid) {
      setError("Parolan en az 10 karakter olmalı, harf ve rakam içermelidir.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar dene.",
          );
        }

        throw new Error(data.error || "Kayıt işlemi gerçekleştirilemedi.");
      }

      window.location.assign("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu. Lütfen tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-card">
      <h1>HızlıParmak'a Katıl</h1>

      <p className="muted">
        Ücretsiz hesap oluştur, on parmak eğitimine başla ve gelişimini takip
        et.
      </p>

      {error && (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <label htmlFor="username">Kullanıcı adı</label>

        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          title="3-20 karakter, yalnızca harf, rakam ve alt çizgi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={busy}
        />

        <label htmlFor="email">E-posta adresi</label>

        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={busy}
        />

        <label htmlFor="password">Parola</label>

        <div className="password-field">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={10}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-describedby="password-rules"
            disabled={busy}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Gizle" : "👁 Göster"}
          </button>
        </div>

        <div id="password-rules" className="password-rules" aria-live="polite">
          <p className={passwordChecks.length ? "rule-valid" : "rule-pending"}>
            {passwordChecks.length ? "✓" : "○"} En az 10 karakter
          </p>

          <p className={passwordChecks.letter ? "rule-valid" : "rule-pending"}>
            {passwordChecks.letter ? "✓" : "○"} En az bir harf
          </p>

          <p className={passwordChecks.number ? "rule-valid" : "rule-pending"}>
            {passwordChecks.number ? "✓" : "○"} En az bir rakam
          </p>
        </div>

        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? "Hesap oluşturuluyor..." : "Ücretsiz Hesap Oluştur"}
        </button>
      </form>

      <p className="muted">
        Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link>
      </p>

      <p className="muted" style={{ fontSize: 12 }}>
        Kayıt oluşturarak{" "}
        <Link href="/kullanim-kosullari">Kullanım Koşulları</Link> ve{" "}
        <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> hakkında
        bilgi edinebilirsin.
      </p>
    </div>
  );
}
