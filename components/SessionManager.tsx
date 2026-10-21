"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IDLE_LIMIT = 30 * 60 * 1000;
const WARNING_TIME = 29 * 60 * 1000;
const REFRESH_INTERVAL = 60 * 1000;

export default function SessionManager() {
  const router = useRouter();

  const lastActivity = useRef(Date.now());
  const lastRefresh = useRef(Date.now());
  const refreshing = useRef(false);
  const loggingOut = useRef(false);

  const [warning, setWarning] = useState(false);

  useEffect(() => {
    async function logout() {
      if (loggingOut.current) return;

      loggingOut.current = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
      } finally {
        window.location.replace("/giris?expired=1");
      }
    }

    async function refreshSession() {
      if (refreshing.current || loggingOut.current) return;

      refreshing.current = true;

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401) {
          await logout();
          return;
        }

        if (response.ok) {
          lastRefresh.current = Date.now();
          router.refresh();
        }
      } catch {
        // Geçici bağlantı hatalarında oturum yenilenmez.
        // Sonraki etkinlikte yeniden denenecektir.
      } finally {
        refreshing.current = false;
      }
    }

    function activity() {
      if (loggingOut.current) return;

      const now = Date.now();

      if (now - lastActivity.current >= IDLE_LIMIT) {
        void logout();
        return;
      }

      lastActivity.current = now;
      setWarning(false);

      if (now - lastRefresh.current >= REFRESH_INTERVAL) {
        void refreshSession();
      }
    }

    function checkIdle() {
      const elapsed = Date.now() - lastActivity.current;

      if (elapsed >= IDLE_LIMIT) {
        void logout();
      } else if (elapsed >= WARNING_TIME) {
        setWarning(true);
      }
    }

    const events = [
      "keydown",
      "pointerdown",
      "pointermove",
      "touchstart",
      "scroll",
    ] as const;

    events.forEach((event) => {
      window.addEventListener(event, activity, {
        passive: true,
      });
    });

    const interval = window.setInterval(checkIdle, 15000);

    document.addEventListener("visibilitychange", checkIdle);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activity);
      });

      window.clearInterval(interval);

      document.removeEventListener("visibilitychange", checkIdle);
    };
  }, [router]);

  if (!warning) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Oturum süresi uyarısı"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99999,
        background: "#10283b",
        color: "#ffffff",
        border: "1px solid #23dacb",
        borderRadius: 14,
        padding: 20,
        maxWidth: 340,
        boxShadow: "0 12px 40px #0008",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Oturumun kapanmak üzere</h3>

      <p>
        Uzun süredir işlem yapmadın. Yaklaşık 1 dakika sonra otomatik çıkış
        yapılacak.
      </p>

      <button
        type="button"
        onClick={() => {
          lastActivity.current = Date.now();
          setWarning(false);
          // Kullanıcının devam etmek istediğini
          // sunucuya da bildir.
          void fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "same-origin",
          }).then((response) => {
            if (response.ok) {
              lastRefresh.current = Date.now();
            } else if (response.status === 401) {
              window.location.replace("/giris");
            }
          });
        }}
        style={{
          background: "#22d3c5",
          color: "#05202b",
          border: 0,
          padding: "10px 16px",
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Oturumumu açık tut
      </button>
    </div>
  );
}
