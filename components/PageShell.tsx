import type { ReactNode } from "react";
export default function PageShell({ title, description, children }: { title: string; description?: string; children?: ReactNode }) { return <section className="page-shell"><div className="page-heading"><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</section>; }
