# HızlıParmak canlıya geçiş kontrolü

Son kontrol: 26 Ekim 2026. Canlı adres: https://hizliparmak-baslangic.vercel.app/

## Yeniden kontrol — 26 Ekim 2026

Bu bölüm aşağıdaki önceki yayın kaydını tamamlar. Canlı ana sayfa ve `/api/health` yeniden HTTP 200 döndürdü; sağlık yanıtı `{"status":"ok"}`. Site tarayıcıda açıldı. Yeni kayıt/ilerleme akışı bu kontrolde tekrarlanmadı; aşağıdaki önceki test kaydı geçerlidir.

Vercel Production ortamının güncel değişken adları kontrol edildi: `EMAIL_PROVIDER` var; `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM`, `SUPPORT_EMAIL`, `ALERT_EMAIL`, `BUSINESS_NAME`, `BUSINESS_ADDRESS` yok. E-posta gönderimi ve hata bildirimi için gerçek kurulum hâlâ eksik. Yerel `.vercel/.env.production.local` eski/maskelemiş bir kopyadır; bu dosyadaki eksik ya da gizlenmiş değerler canlı veritabanı/oturum ayarlarının bozuk olduğunu göstermez.

Yerelde Gmail SMTP adaptörü, bağlantı zaman aşımı/TLS ayarları, gönderici kontrolü, hassas hata ayrıntılarını gizleme ve ilgili doğrulama komutu mevcut. Bu değişiklikler Git çalışma ağacında henüz commit edilmemiş durumda bulundu; canlıya yayımlandıkları varsayılmamalıdır. Gmail kurulumu için [GMAIL_KURULUMU.md](GMAIL_KURULUMU.md) izlenmeli.

Yeniden geçen kontroller: `check:launch`, `check:email`, 100 farklı Q/F ders müfredatı ve üç saat diliminde İstanbul sınav takvimi. `next build` ile üretim derlemesi ve TypeScript kontrolleri geçti. `npm run build` içindeki Prisma üretimi Windows'ta açık istemcinin DLL kilidine takıldı; Next.js derlemesi mevcut üretilmiş istemciyle doğrulandı. E-posta testi sahte taşıyıcı kullanır; gerçek e-posta göndermez ve teslimatı doğrulamaz.

`check:new-flows` yeniden geçti: eski şifreli yedekten ayrı yerel şemaya geri yükleme/migration ve mevcut alanların korunması; doğrulama, süresi dolmuş/yeniden kullanılan tokenlar, kaynak kontrolü, parola sıfırlama ve eski oturumların reddi; şikâyet/engelleme/yönetici yetkisi/askıya alma; sunucuda yarış hesaplama ve tekrar/erken/gecikmiş gönderim korumaları. Test şeması temizlendi; canlı uygulama verisi değiştirilmedi. Yeni hazırlık kontrolünün eksik ayarlarla başarısız, tam örnek ayarlarla başarılı olduğu da doğrulandı.

Yeni `npm run check:readiness` komutu, enjekte edilen Production ayarlarını sırları yazdırmadan denetler. Belirli bir dosya için `npm run check:readiness -- --env-file <dosya>` kullanılabilir; yerel `.env` dosyasına otomatik dönmez. Eksik kurulumda çıkış kodu 1'dir. Gerçek teslimat, yönetici erişimi, nihai hukuki metinler, reklam onayı/izin yönetimi ve son yedek geri yüklemesi ayrıca doğrulanmalıdır.

Öncelik sırası: (1) Gmail uygulama şifresi/gönderici kurulumu ve gerçek teslimat testi; (2) destek/hata adresleri ve gerçek veri sorumlusu bilgileri; (3) belirtilen mevcut hesaba yönetici ataması; (4) nihai hukuki metinler ve reklam izin/onay kontrolü. Ödeme kapalı kalır. Bu bilgiler olmadan uygulama tamamen canlıya hazır olarak işaretlenemez.

.com satın alımı kullanıcı isteğiyle kapsam dışındadır. Yerel test verileri canlıya taşınmadı.

| No | Madde | Güncel durum / kalan iş |
|---|---|---|
| 1 | Bulut PostgreSQL | Tamam. Mevcut Neon ve Vercel bağlantısı korunuyor. |
| 2 | Tablolar ve dersler | Tamam. 100 farklı ders korunuyor; toplam sekiz migration canlı ve yerelde uygulandı. Yeni tablolar eklenirken mevcut veriler korundu. |
| 3 | Oturum güvenliği | Tamam. Production anahtarı ve güvenli çerezler korunuyor. Parola sıfırlanınca eski oturumların tamamı geçersiz oluyor. |
| 4 | Redis | Tamam. Kayıt/giriş korumaları çalışıyor. E-posta ve yarış başlangıcı istek sınırları eklendi. |
| 5 | .com | Kapsam dışı; henüz satın alınmadı. |
| 6 | Site adresi | Mevcut Vercel adresi etkin; .com bağlanırsa değiştirilecek. |
| 7 | Canlı testler | Tekrar geçti. Kayıt, giriş, F klavye, ders, çıkış, tekrar giriş, tercihler ve ilerleme, parola ile hesap silme sınandı. Test hesabı temizlendi. |
| 8 | E-posta işlemleri | Kod canlıda hazır: süreli tek kullanımlık doğrulama/sıfırlama bağlantıları, özetlenmiş tokenlar, istek sınırları ve oturum iptali. Gerçek gönderim henüz KAPALI. Gönderim hesabı, doğrulanmış gönderici ve Production RESEND_API_KEY / EMAIL_FROM gerekiyor. Gerçek teslimat testi yapılmadı. |
| 9 | Hesap ayarları | Tercihler ve ödeme kaydı olmayan hesaplarda parolayla silme çalışıyor. Engellenen kullanıcıları yönetme eklendi. Ödeme/abonelik geçmişi olan hesaplar için saklama ve silme süreci hâlâ kararlaştırılmalı. |
| 10 | Hukuki bilgiler ve çerezler | Reklam kodu çerez tercihinden bağımsız yüklenir; önceki izin koşulu kaldırıldı. Çerez ekranı, reklamı kapatma seçeneği sunmayan doğru bir bilgilendirme ekranı olarak güncellendi. Gerçek işletme/veri sorumlusu, destek adresi, saklama süreleri, hukuki dayanak ve aktarım bilgileri eksik; gizlilik/kullanım metinleri nihai değil. İletişim bilgileri ortam değişkenlerinden yayımlanabilir. |
| 11 | Topluluk yönetimi | Şikâyet, yönetici incelemesi, içerik kaldırma, topluluk erişimini askıya alma/kaldırma ve iki yönlü kullanıcı engelleme canlıda hazır. Yönetici yapılacak gerçek hesap henüz belirtilmedi; bu atama bekliyor. |
| 12 | Ödeme | Kapalı kalıyor. Gerçek sağlayıcı anahtarları, işletme/iadeler ve canlı ödeme testleri olmadan satış açılmadı. |
| 13 | Yarış doğrulaması | Tamamlandı: sunucu başlangıç zamanı, sunucuda metin/süre/skor hesabı ve tekrar gönderim koruması. Erken bitirilen 3/5 dakikalık çalışmalar sıralamaya girmez; gecikmiş gönderim reddedilir. Bu önlemler otomatik yazan botlara karşı kesin hilesizlik garantisi değildir. |
| 14 | Reklam | ads.txt ve kod mevcut. Reklam kodu tercih beklemeden yükleniyor. Google hesap onayı, gerçek reklam gösterimi ve gerekli sertifikalı CMP kurulumu doğrulanmadı. |
| 15 | Kaynak, yedek, izleme | Kod GitHub'a gönderildi. GitHub Actions günlük şifreli yedek + her seferinde PostgreSQL'e geri yükleme/satır karşılaştırması ve yarım saatlik sağlık kontrolü kuruldu. Sırlar güvenle kaydedildi. İlk sağlık ve bulut yedek/geri yükleme işleri başarıyla tamamlandı. Güncelleme öncesi/sonrası yerel geri yükleme testleri başarılı. Hata e-postası kodu hazır; gönderim hizmeti, bildirim adresi ve gerçek bildirim teslimatı eksik. |

## Yayımlanan sürüm

Vercel production deployment: dpl_7b5BikD8JBiYgFcwkayStWVLdNoB (READY).

Son kod sürümü: 7a9798a (`fix: load advertising independently of former cookie preference`). Özelliklerin kaynak kaydı: 3ffb236. Yerel geliştirme sunucusu http://localhost:3000 üzerinde yeniden başlatıldı; instrumentation derlemesi ve PostgreSQL/Redis sağlık kontrolü başarılı.

## Bulutta doğrulanan otomatik işler

- [Şifreli yedek, PostgreSQL geri yükleme ve satır karşılaştırması](https://github.com/ayseturan02/hizliparmak-baslangic/actions/runs/40299391007): success; şifreli dosya artifact olarak yüklendi.
- [Canlı sağlık kontrolü](https://github.com/ayseturan02/hizliparmak-baslangic/actions/runs/40299395690): success.

## Tamamlanan doğrulamalar

Üretim derlemesi, ortam/ödeme korumaları, 100 ders müfredatı, üç saat diliminde İstanbul sınav takvimi, ayrı şemada eski verilerin üstüne migration ve yeni akışların gerçek HTTP testleri geçti. Canlı hesap akışı ve mobil taşma kontrolü geçti. Önceki çerez izin testleri önceki sürüme aittir; reklamlar artık çerez tercihiyle kapatılmıyor.

Son yerel doğrulanmış şifreli yedek: `.vercel/backups/2026-10-26T09-17-53-888Z.hpbackup`.

Yedek anahtarı `.vercel/backup.key` içindedir; kaynak koduna veya sohbet mesajına konmamalıdır. Bağımsız, erişimi kısıtlı kopyasını işletmeci de korumalıdır.

## Senden gerekenler

1. Gönderim hizmeti hesabı ve doğrulanmış gönderici adresi; gerçek destek ve hata bildirimi adresi. Anahtarlar sohbete değil Vercel'in Production ortam ayarlarına girilmeli.
2. Gerçek işletme/veri sorumlusu adı, adresi ve hukuki metinler için veri saklama/başvuru süreçleri.
3. Yönetici yapılacak mevcut hesabın e-postası. Rastgele bir hesaba yetki verilmedi.
4. AdSense hesabındaki güncel inceleme/onay durumu ve Google izin yönetimi gereksinimleri.
5. Ödeme açılacaksa sağlayıcı hesabı, işletme/iade koşulları ve gerçek testler. Ödeme geçmişi olan hesaplarda silme/saklama yöntemi.

Otomatik yedekleme: her gün 04:23 İstanbul; şifreli bulut artifact saklama süresi 30 gün. Sağlık kontrolü: her saatin 11. ve 41. dakikası. GitHub bildirim tercihi ve gerçek e-posta teslimatı ayrıca doğrulanmalıdır. Herkese açık depoda 60 gün etkinlik olmaması zamanlanmış işleri durdurabilir.

Kurulum ayrıntıları, komutlar ve sınırlar: [EMAIL_VE_IZLEME_KURULUMU.md](EMAIL_VE_IZLEME_KURULUMU.md).

## Kullanım komutları

- `npm run dev`: yerel geliştirme.
- `npm run build`: üretim derlemesi.
- `npm run check:launch`: ortam ve ödeme korumaları.
- `npm run check:new-flows`: ayrı yerel şemada migration ve yeni güvenlik akışları; yerel PostgreSQL ile doğrulanmış `.vercel` yedeği/anahtarı gerektirir.
- `npm run check:account`: varsayılan localhost üzerinde geçici hesapla hesap akışı.
- `npm run db:deploy`: yalnızca hedef DATABASE_URL doğrulandıktan sonra migration uygulama.
- `npm run db:update-lessons`: mevcut ders kimliklerini/ilerlemeleri koruyarak müfredat güncelleme.
- `npm run db:backup -- --source-env .vercel/.env.production.local --key-file .vercel/backup.key --verify-local`: şifreli canlı yedek ve ayrı yerel şemada geri yükleme doğrulaması.

`.env`, `.vercel`, anahtarlar ve yedekler Git/Vercel paketinden hariçtir. Yerel ilk-kurulum seed'i mevcut kullanıcı verileri olan veritabanına gelişigüzel uygulanmamalıdır.

## Reklam davranışı güncellemesi

Google reklam kodunun yüklenmesini önceki “Yalnızca gerekli” tercihiyle durduran koşul kaldırıldı. Bilgilendirmeyi kapatmak reklam izni olarak yorumlanmaz. Yönetim, ödeme, giriş/kayıt ve parola işlemleri sayfalarının reklam hariç tutmaları ile reklamsız aktif abonelik davranışı korunur. Manuel sağ/sol reklam birimi kimliği canlı ortamda hâlâ eksiktir; Auto ads yerleşim ve reklam gösterimini Google belirler. Google hesap onayı ve bölgeye göre izin yönetimi gereksinimleri hâlâ doğrulanmalıdır.

Tarayıcı doğrulaması: eski ads:false kaydı varken reklam betiği yükleniyor; eski tercih temizleniyor; bilgilendirmeyi kapatmak reklamları durdurmuyor. Giriş sayfasında reklam betiği yüklenmiyor.

Son reklam güncellemesi Vercel READY durumunda canlıya yayımlandı. Canlı Chrome testi, eski gerekli-çerez tercihi varken reklam kodunun otomatik yüklendiğini ve bilgi ekranını kapatmanın reklamı durdurmadığını doğruladı. Gerçek reklam ağ çağrıları test sırasında engellendi; bu test reklam doluluğu/onayını doğrulamaz.
