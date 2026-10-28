"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import KeyboardGuide from "@/components/KeyboardGuide";
import TypingFeedback from "@/components/TypingFeedback";
import type { LessonLayout } from "@/lib/lessons";

const sample = "Düzenli çalışma, doğru parmak kullanımı ve tekrar yazma hızını geliştirir.";
export default function TypingTest({ text = sample, lessonSlug, contestId, focusKeys, keyboardLayout = "TR", saveProgress = true }: {
  text?: string; lessonSlug?: string; contestId?: string; focusKeys?: string; keyboardLayout?: LessonLayout; saveProgress?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const [serverStats, setServerStats] = useState<{ wpm: number; accuracy: number } | null>(null);
  const submitted = useRef(false);
  const startRequest = useRef<Promise<string | null> | null>(null);
  const generation = useRef(0);
  const shouldSave = Boolean(contestId || (lessonSlug && saveProgress));

  useEffect(() => {
    if (!startedAt || typed.length === text.length) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startedAt, typed.length, text.length]);
  const elapsed = startedAt ? Math.max(1, (now - startedAt) / 1000) : 0;
  const correct = useMemo(() => {
    let count = 0;
    for (let i = 0; i < Math.min(typed.length, text.length); i++) if (typed[i] === text[i]) count++;
    return count;
  }, [typed, text]);
  const accuracy = serverStats?.accuracy ?? (typed.length ? Math.round(correct / typed.length * 10000) / 100 : 100);
  const wpm = serverStats?.wpm ?? (elapsed ? Math.round(correct / 5 / (elapsed / 60) * 100) / 100 : 0);

  function begin() {
    if (!shouldSave) return;
    const version = generation.current;
    const endpoint = contestId ? "/api/weekly-contest/start" : "/api/progress/start";
    startRequest.current = (async () => {
      try {
        const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contestId ? { contestId } : { slug: lessonSlug, keyboardLayout }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Çalışma başlatılamadı.");
        return contestId ? contestId : data.attemptId as string;
      } catch (error) {
        if (generation.current === version) {
          setSaveError(true);
          setSaveMessage(error instanceof Error ? error.message : "Çalışma başlatılamadı.");
        }
        return null;
      }
    })();
  }

  useEffect(() => {
    if (!shouldSave || typed.length !== text.length || !startedAt || submitted.current) return;
    submitted.current = true;
    const version = generation.current;
    setSaving(true);
    void (async () => {
      try {
        const attemptId = await startRequest.current;
        if (!attemptId) throw new Error("Çalışma sunucuda başlatılamadı. Yeniden başlat düğmesini kullan.");
        const response = await fetch(contestId ? "/api/weekly-contest/submit" : "/api/progress", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contestId ? { contestId, typed } : { attemptId, slug: lessonSlug, typed, keyboardLayout }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Sonuç kaydedilemedi.");
        if (version !== generation.current) return;
        if (typeof data.wpm === "number" && typeof data.accuracy === "number") setServerStats({ wpm: data.wpm, accuracy: data.accuracy });
        setSaveMessage(data.message || "Sonuç kaydedildi.");
        setSaveError(false);
      } catch (error) {
        if (version !== generation.current) return;
        setSaveMessage(error instanceof Error ? error.message : "Sonuç kaydedilemedi.");
        setSaveError(true);
      } finally {
        if (version === generation.current) setSaving(false);
      }
    })();
  }, [lessonSlug, contestId, shouldSave, typed, text.length, startedAt, keyboardLayout, retry]);

  return <div className="typing-test">
    <div className="typing-stats"><div><span>Hız</span><strong>{wpm.toFixed(0)} <small>KDM</small></strong></div><div><span>Doğruluk</span><strong>%{accuracy.toFixed(1)}</strong></div><div><span>Yazılan</span><strong>{typed.length}/{text.length}</strong></div></div>
    <div className="typing-prompt" aria-label="Yazılacak metin">{text.split("").map((char, i) => <span key={i} className={i < typed.length ? (typed[i] === char ? "char-correct" : "char-wrong") : i === typed.length ? "char-current" : ""} title={i < typed.length && typed[i] !== char ? "Hatalı vuruş. Beklenen: " + (char === " " ? "Boşluk" : char) : undefined}>{char === " " && i < typed.length && typed[i] !== char ? "␣" : char}</span>)}</div>
    <TypingFeedback target={text} typed={typed}/>
    {lessonSlug && <KeyboardGuide next={text[typed.length]} focusKeys={focusKeys} layout={keyboardLayout}/>}
    <textarea aria-invalid={typed.length > correct} aria-label="Yazma alanı" value={typed} readOnly={submitted.current && typed.length === text.length}
      onPaste={event => { if (shouldSave) event.preventDefault(); }}
      onDrop={event => { if (shouldSave) event.preventDefault(); }}
      onChange={event => {
        if (!startedAt && event.target.value.length) { setStartedAt(Date.now()); begin(); }
        setNow(Date.now());
        setTyped(event.target.value.slice(0, text.length));
      }} placeholder="Yukarıdaki metni buraya yazmaya başla..." rows={3}/>
    {typed.length === text.length && <div className="notice notice-success">Test tamamlandı! Hız: {wpm.toFixed(1)} KDM, doğruluk: %{accuracy.toFixed(1)}.{saving ? " Sonuç kaydediliyor..." : lessonSlug && !saveProgress ? " İlerlemeni kaydetmek için giriş yap." : ""}</div>}
    {saveMessage && <div role="status" className={`notice ${saveError ? "notice-error" : "notice-success"}`}>{saveMessage}</div>}
    <div className="test-actions"><span className="muted">KDM = dakikadaki kelime (5 karakter)</span>
      {saveError && typed.length === text.length && !saving && <button className="button button-ghost" onClick={() => { submitted.current = false; setRetry(value => value + 1); }}>Kaydetmeyi tekrar dene</button>}
      <button className="button button-ghost" disabled={saving} onClick={() => {
        generation.current++; setTyped(""); setStartedAt(null); setNow(Date.now()); setSaveMessage(""); setSaveError(false); setServerStats(null); submitted.current = false; startRequest.current = null;
      }}>Yeniden başlat</button>
    </div>
  </div>;
}
