import PageShell from "@/components/PageShell";
export default function ContactPage() {
 const email = process.env.SUPPORT_EMAIL, name = process.env.BUSINESS_NAME, address = process.env.BUSINESS_ADDRESS;
 return <PageShell title="İletişim" description="Hesap, içerik ve gizlilik taleplerin için iletişim bilgileri."><div className="panel">{name&&<p><strong>İşletme / veri sorumlusu:</strong> {name}</p>}{address&&<p><strong>Adres:</strong> {address}</p>}{email?<p><strong>Destek:</strong> <a href={`mailto:${email}`}>{email}</a></p>:<p>Destek e-posta adresi henüz yayımlanmadı.</p>}<p>Topluluk içeriğiyle ilgili şikâyetlerini, giriş yaptıktan sonra içerik altındaki Şikâyet et düğmesiyle iletebilirsin.</p></div></PageShell>;
}
