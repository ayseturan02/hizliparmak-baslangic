import EmailActions from "@/components/EmailActions";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page() { return <div className="form-card"><h1>Yeni parola belirle</h1><EmailActions mode="reset"/></div>; }
