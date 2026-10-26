"use client";
export default function TypingFeedback({ target, typed }: { target: string; typed: string }) {
 let count = 0, last = -1;
 for (let index = 0; index < typed.length; index++) if (typed[index] !== target[index]) { count++; last = index; }
 const label = (char?: string) => char === " " ? "Boşluk" : char === "\n" ? "Enter" : char || "Metin sonu";
 return <div className={"typing-feedback" + (count ? " has-mistake" : " is-correct")} role="status" aria-live="polite" aria-atomic="true">{count ? <><span className="feedback-icon" aria-hidden="true">!</span><span><strong>{count} hatalı vuruş</strong><span className="feedback-detail">Son hatada beklenen <kbd>{label(target[last])}</kbd>, yazdığın <kbd>{label(typed[last])}</kbd>. Backspace ile düzeltebilirsin.</span></span></> : <><span className="feedback-icon" aria-hidden="true">✓</span><span>{typed ? "Doğru ilerliyorsun. Aynı sakin ritmi koru." : "Önce doğru tuş, sonra hız. Yazmaya başladığında rehber seni izleyecek."}</span></>}</div>;
}
