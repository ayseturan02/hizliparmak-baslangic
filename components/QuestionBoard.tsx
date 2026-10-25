"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
type Entry = { id: string; content: string; createdAt: string; user: { username: string } };
type Question = Entry & { title: string; _count: { answers: number } };
async function api(url: string, body?: unknown) {
 const response = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
 const data = await response.json();
 if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı.");
 return data;
}
function Meta({ entry }: { entry: Entry }) {
 return <div className="qa-meta"><span>@{entry.user.username}</span><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</time></div>;
}
function LoginPrompt() { return <p className="muted">Soru sormak veya cevap yazmak için <Link href="/giris?next=/soru-cevap">giriş yap</Link> ya da <Link href="/kayit">ücretsiz kayıt ol</Link>.</p>; }
function QuestionCard({ question, signedIn }: { question: Question; signedIn: boolean }) {
 const [open, setOpen] = useState(false), [answers, setAnswers] = useState<Entry[]>([]), [cursor, setCursor] = useState<string | null>(null), [content, setContent] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), [count, setCount] = useState(question._count.answers);
 async function load(more = false) {
  setLoading(true); setError("");
  try { const data = await api("/api/questions/" + question.id + "/answers" + (more && cursor ? "?cursor=" + encodeURIComponent(cursor) : "")); setAnswers(old => more ? [...old, ...data.answers] : data.answers); setCursor(data.nextCursor); }
  catch (e) { setError(e instanceof Error ? e.message : "Cevaplar yüklenemedi."); } finally { setLoading(false); }
 }
 async function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); if (busy) return; setBusy(true); setError("");
  try { await api("/api/questions/" + question.id + "/answers", { content }); setContent(""); setCount(n => n + 1); await load(); }
  catch (e) { setError(e instanceof Error ? e.message : "Cevap gönderilemedi."); } finally { setBusy(false); }
 }
 return <article className="panel qa-question"><Meta entry={question}/><h2>{question.title}</h2><p className="qa-content">{question.content}</p><button type="button" className="button button-ghost" aria-expanded={open} aria-controls={"answers-" + question.id} onClick={() => { setOpen(!open); if (!open) void load(); }}>{count} cevap · {open ? "Cevapları gizle" : "Cevapları gör / cevap yaz"}</button>
 {open && <section className="qa-answers" id={"answers-" + question.id} aria-label="Cevaplar"><h3>Cevaplar</h3>{loading && <p role="status">Cevaplar yükleniyor…</p>}{!loading && !error && answers.length === 0 && <p className="muted">Henüz cevap yok. İlk cevabı sen yaz!</p>}{answers.map(answer => <article className="qa-answer" key={answer.id}><Meta entry={answer}/><p className="qa-content">{answer.content}</p></article>)}{cursor && <button type="button" className="button button-ghost" disabled={loading} onClick={() => void load(true)}>Diğer cevapları yükle</button>}{error && <div role="alert" className="notice notice-error">{error} <button type="button" className="chat-action" onClick={() => void load()}>Tekrar dene</button></div>}{signedIn ? <form className="qa-form" onSubmit={submit}><label htmlFor={"reply-" + question.id}>Cevabın</label><textarea id={"reply-" + question.id} value={content} onChange={e => setContent(e.target.value)} minLength={2} maxLength={3000} rows={4} required placeholder="Bu soruyla ilgili bildiklerini paylaş…"/><div className="qa-form-footer"><span className="muted">{content.length}/3000</span><button className="button button-primary" disabled={busy || content.trim().length < 2}>{busy ? "Gönderiliyor…" : "Cevap gönder"}</button></div></form> : <LoginPrompt/>}</section>}</article>;
}
export default function QuestionBoard({ signedIn }: { signedIn: boolean }) {
 const [questions, setQuestions] = useState<Question[]>([]), [cursor, setCursor] = useState<string | null>(null), [title, setTitle] = useState(""), [content, setContent] = useState(""), [error, setError] = useState(""), [formError, setFormError] = useState(""), [success, setSuccess] = useState(""), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
 const load = useCallback(async (next?: string) => {
  setLoading(true); setError("");
  try { const data = await api("/api/questions" + (next ? "?cursor=" + encodeURIComponent(next) : "")); setQuestions(old => next ? [...old, ...data.questions] : data.questions); setCursor(data.nextCursor); }
  catch (e) { setError(e instanceof Error ? e.message : "Sorular yüklenemedi."); } finally { setLoading(false); }
 }, []);
 useEffect(() => { void load(); }, [load]);
 async function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); if (busy) return; setBusy(true); setFormError(""); setSuccess("");
  try { await api("/api/questions", { title, content }); setTitle(""); setContent(""); setSuccess("Sorun yayınlandı. Topluluk artık cevap yazabilir."); await load(); }
  catch (e) { setFormError(e instanceof Error ? e.message : "Soru gönderilemedi."); } finally { setBusy(false); }
 }
 return <div className="qa-layout"><aside className="panel qa-compose"><span className="eyebrow">TOPLULUĞA SOR</span><h2>Bir sorun mu var?</h2><p className="muted">Başlığını açık yaz, sorunu ayrıntılarıyla anlat. Cevap verirken saygılı ve yardımcı ol.</p>{signedIn ? <form className="qa-form" onSubmit={submit}><label htmlFor="question-title">Soru başlığı</label><input id="question-title" required minLength={5} maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn. F klavyede hızımı nasıl artırabilirim?"/><label htmlFor="question-content">Sorunun ayrıntıları</label><textarea id="question-content" required minLength={10} maxLength={5000} rows={7} value={content} onChange={e => setContent(e.target.value)} placeholder="Neyi öğrenmek istiyorsun?"/><span className="muted">{content.length}/5000</span>{formError && <p className="notice notice-error" role="alert">{formError}</p>}{success && <p role="status">{success}</p>}<button className="button button-primary" disabled={busy || title.trim().length < 5 || content.trim().length < 10}>{busy ? "Yayınlanıyor…" : "Soruyu yayınla"}</button></form> : <LoginPrompt/>}</aside><section className="qa-list" aria-label="Topluluk soruları"><div className="qa-list-heading"><h2>Son sorular</h2><button type="button" className="button button-ghost" disabled={loading} onClick={() => void load()}>Yenile</button></div>{error && <p className="notice notice-error" role="alert">{error}</p>}{loading && <p role="status">Sorular yükleniyor…</p>}{!loading && !error && questions.length === 0 && <div className="panel empty-state"><h3>İlk soruyu sen sor!</h3><p className="muted">Henüz soru paylaşılmadı. Topluluğun bilgisinden yararlanmak için bir soru sor.</p></div>}{questions.map(question => <QuestionCard key={question.id} question={question} signedIn={signedIn}/>)}{cursor && <button type="button" className="button button-ghost" disabled={loading} onClick={() => void load(cursor)}>Daha fazla soru yükle</button>}</section></div>;
}
