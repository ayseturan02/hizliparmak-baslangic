# E-posta, moderasyon ve izleme kurulumu

26 Ekim 2026. Uygulama: https://hizliparmak-baslangic.vercel.app/

## E-posta gönderimini etkinleştirme

Resend API ve Gmail SMTP adaptörleri hazırdır. Gmail seçeneği için [GMAIL_KURULUMU.md](GMAIL_KURULUMU.md) izlenmelidir; `EMAIL_PROVIDER=gmail`, `GMAIL_USER` ve `GMAIL_APP_PASSWORD` gerekir. Aşağıdaki Resend adımları alternatif sağlayıcı içindir; Resend kullanılacaksa `EMAIL_PROVIDER=resend` ayarlanmalıdır. Yeni bir hizmet hesabı açılmadı, ücretli hizmet satın alınmadı.

1. Gönderim hesabını ve hesabın izin verdiği gerçek gönderici adresini doğrula. Resend kullanılırsa kontrol edilen bir alan adının DNS doğrulaması gerekir; Vercel alt alanı kullanıcının DNS yönetiminde değildir. .com zorunlu değildir, ancak gönderim yetkisi olan bir adres/hizmet gerekir. Resend test göndericisi tüm kullanıcılara gönderim için yeterli değildir.
2. Vercel projesinin Production ortamına `RESEND_API_KEY` ve `EMAIL_FROM` ekle. Örnek biçim: `HızlıParmak <destek@kontrol-edilen-alan-adi>`; bu bir örnektir, gerçek adres değildir. Anahtarları sohbet mesajına veya kaynak koduna koyma.
3. Gerçek destek adresini `SUPPORT_EMAIL`, işletme/veri sorumlusu adını `BUSINESS_NAME`, gerçek adresi `BUSINESS_ADDRESS` olarak ekle. Bu değişkenler yoksa bilgi uydurulmaz.
4. Hata e-postaları için işletmeciye ait `ALERT_EMAIL` ekle. Gönderici kurulmadan hata e-postaları gönderilemez.
5. Vercel'i yeniden yayımla ve sahibi olduğun test adresiyle gelen kutusu/spam dahil gerçek teslimatı, bağlantı süresini ve tekrar kullanım reddini doğrula.

Şu anda gönderim kapalıdır; API açıkça 503 döndürür. Sıfırlama sayfası `/parolami-unuttum`, doğrulama isteği Hesabım sayfasındadır. Adres doğrulaması mevcut hesapları engelleyen zorunlu bir giriş koşulu yapılmadı.

Parola bağlantıları 30 dakika, doğrulama bağlantıları 24 saat geçerlidir. Veritabanında yalnızca SHA-256 özetleri tutulur. Bağlantı sırrı URL fragment'inde taşınır ve sayfa açılınca adres çubuğundan temizlenir. GET isteği işlem yapmaz; kullanıcı düğmeye basmalıdır. Parola değişikliği bütün eski oturumları ve diğer parola sıfırlama bağlantılarını geçersiz kılar. Süresi en az yedi gün önce dolan tokenlar, ilgili kullanıcıya yeni bağlantı üretilirken temizlenir.

Resend API referansı: https://resend.com/docs/api-reference/emails/send-email

## Topluluk yönetimi

Şikâyet, içerik kaldırma, hesap askısı ve askı kaldırma kodu canlıdadır. Şikâyetler `/yonetim/moderasyon`, askı kaldırma `/yonetim/uyeler` sayfasındadır. Yönetim erişimi sunucuda ADMIN rolüyle kontrol edilir. Kullanıcı engelleri Hesabım'dan kaldırılabilir; sohbet, soru ve cevaplarda iki yönde uygulanır. Herkese açık topluluk içeriği, çıkış yapmış ziyaretçilerce görüntülenebilir; engelleme gizli içerik özelliği değildir.

Yönetici olacak gerçek hesap henüz belirtilmedi. Önce normal kayıt yapılmalı ve hesabın e-postası sahip tarafından belirtilmelidir; rastgele bir hesaba yetki verilmedi. Yönetici ataması, belirtilen mevcut hesabın doğru canlı veritabanında bulunması doğrulandıktan sonra yapılmalıdır. Rol ataması istemci API'sine açılmadı.

## Otomatik yedekleme

`.github/workflows/production-backup.yml` her gün 01:23 UTC / 04:23 İstanbul saatinde çalışır. Veritabanının tutarlı anlık görüntüsü AES-256-GCM ile şifrelenir. Her çalışmada ayrı bir geçici PostgreSQL şemasına geri yüklenir ve bütün satırlar karşılaştırılır. Yalnızca şifreli `.hpbackup` dosyası GitHub Actions artifact olarak yüklenir; saklama süresi 30 gündür.

`BACKUP_DATABASE_URL` ve `BACKUP_ENCRYPTION_KEY` GitHub Actions sırlarına şifrelenerek kaydedildi. Yerel anahtar `.vercel/backup.key`, yerel yedekler `.vercel/backups` altındadır; ikisi de Git ve Vercel paketinin dışındadır. Anahtarın işletmeci tarafından erişimi kısıtlı bağımsız bir kopyası da korunmalıdır. Yedekler uygulama tablolarını kapsar; PostgreSQL rolleri ve sağlayıcı ayarları için tam sunucu yedeği değildir.

GitHub Actions zamanlamaları gecikebilir. Herkese açık depolarda 60 gün etkinlik olmazsa zamanlanmış işler kapanabilir; Actions sekmesinden son başarılı çalışmayı düzenli kontrol et. Daha sıkı kesintisiz çalışma hedefi için bağımsız zamanlayıcı/izleme hizmeti ayrıca değerlendirilmelidir.

İşler: https://github.com/ayseturan02/hizliparmak-baslangic/actions
GitHub zamanlama davranışı: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Sağlık ve hata takibi

`.github/workflows/production-monitor.yml` her saatin 11. ve 41. dakikasında anasayfayı ve `/api/health` yolunu sınar. Sağlık yolu PostgreSQL ve Redis'e erişimi denetler; bağlantı bilgisi yayınlamaz. Bu kontrol erişilebilirlik içindir, bütün kullanıcı akışlarının sürekli testi değildir.

GitHub Actions başarısız iş bildirimlerinin e-posta olarak gelmesi hesap bildirim ayarlarına bağlıdır. Ayarlar: https://github.com/settings/notifications . E-posta/yalnızca başarısız işler tercihi bu oturumda değiştirilmedi ve teslimat doğrulanmadı.

`instrumentation.ts`, `ALERT_EMAIL` ve gönderici tanımlanınca yakalanmamış sunucu hatalarını en çok 15 dakikada bir bildirir. Çerez, istek gövdesi ve hata ayrıntısı e-postaya eklenmez. API'nin kendi içinde yakalayıp 4xx/5xx yanıtladığı bütün hataları kapsayan bir merkezi hata takip hizmeti kurulmuş değildir. Vercel günlükleri kullanılmaya devam eder.

Bildirim davranışı: https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs

## Reklam ve çerezler

Reklam kodu çerez tercihinden bağımsız otomatik yüklenir. Eski “Yalnızca gerekli” tercihi artık reklamları durdurmaz; eski kayıt kullanılmaz. Çerez ekranı yalnızca bilgi verir, kapatma düğmesi reklam izni değildir. Çerez sayfası bu davranışı açıklar.

Manuel sağ/sol birim kimliği canlı ortamda henüz yoktur; Auto ads reklamları ve yerleşimleri Google tarafından belirlenir. AdSense hesabındaki güncel onay, gerçek reklam gösterimi ve Google tarafındaki bölgesel izin yönetimi gereksinimleri ayrıca kontrol edilmelidir. Bilgilendirme ekranı sertifikalı CMP değildir. `ads.txt` tek başına reklam onayı değildir.

## Son doğrulamalar

- `npm run build`: başarılı.
- `npm run check:launch`: başarılı; ödeme kapalı kalıyor.
- `npm run check:new-flows`: eski canlı yedekten ayrı yerel şema, eski şema üstüne yeni migration'lar, mevcut satırların korunması, e-posta tokenları, oturum iptali, moderasyon ve yarışlar başarılı.
- Müfredat ve İstanbul sınav takvimi kontrolleri başarılı.
- Canlı kayıt, giriş, F klavye dersi, tercih/ilerleme korunması, çıkış, tekrar giriş ve hesap silme başarılı; test hesabı temizlendi.
- Önceki izin açma/kapama testleri önceki sürüme aittir; güncel sürümde reklam kodu çerez tercihinden bağımsızdır.
- Canlı şemanın güncelleme öncesi ve sonrası şifreli yedeği, ayrı yerel şemaya geri yüklenip satır karşılaştırmasıyla doğrulandı.

İlk bulut yedek/geri yükleme işi: https://github.com/ayseturan02/hizliparmak-baslangic/actions/runs/40299391007 (success).
İlk sağlık işi: https://github.com/ayseturan02/hizliparmak-baslangic/actions/runs/40299395690 (success).
