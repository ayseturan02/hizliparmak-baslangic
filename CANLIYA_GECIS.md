# HızlıParmak canlıya geçiş kontrolü

Son kontrol: 26 Ekim 2026. Canlı adres: https://hizliparmak-baslangic.vercel.app/

## 15 maddenin güncel durumu

| No | Madde | Durum ve kalan iş |
|---|---|---|
| 1 | Bulut PostgreSQL | Tamamlandı. Ücretsiz Neon kaynağı hizliparmak-db, doğru Vercel projesine Production için bağlandı. Bağlantı sorgusu başarılı. |
| 2 | Tablolar ve 100 ders | Tamamlandı. Dört migration uygulandı; ChatMessage ve User.examScore dahil canlı şema Prisma ile eşleşti. 100 dersin içerikleri birbirinden farklı. Kullanıcının isteğiyle yerel test hesapları/verileri taşınmadı. |
| 3 | Oturum güvenliği | Tamamlandı. Production AUTH_SECRET var; yerel .env dosyaları dağıtımdan çıkarıldı. Canlı kayıt/girişte HttpOnly, Secure, SameSite=Lax çerezi doğrulandı. |
| 4 | Redis erişimi | Tamamlandı. Production URL ve token mevcut; canlı kayıt ve giriş Redis kullanan sınır kontrollerinden geçerek çalıştı. |
| 5 | .com alan adı | Bekliyor. Henüz alınmadı. İsim seçilip satın alındıktan sonra Vercel Domains, DNS, www yönlendirmesi ve HTTPS doğrulanacak. |
| 6 | Canlı site adresi | Mevcut Vercel adresi için tamamlandı. NEXT_PUBLIC_APP_URL artık canlı HTTPS adresi. .com bağlanınca tekrar değiştirilecek ve yeniden dağıtım yapılacak. |
| 7 | Canlı kullanıcı akışı | Tamamlandı. Kayıt, giriş, F klavye tercihi, ders tamamlama, çıkış ve tekrar giriş sonrası kayıtların korunması gerçek yayında test edildi. Geçici test hesabı temizlendi. |
| 8 | Şifre sıfırlama ve e-posta doğrulama | Eksik. Kullanıcının henüz gönderim hizmeti yok. Önce hizmet ve doğrulanmış gönderici kurulacak; süreli tek kullanımlık bağlantılar ve e-posta doğrulama akışları geliştirilecek. |
| 9 | Hesap tercihleri ve silme | Klavye ve gizlilik tercihleri veritabanına kaydoluyor. Gizli profil 404 döndürüyor; haftalık sıralama görünürlük tercihine uyuyor. Parola ve açık onay ile ödeme kaydı olmayan hesaplar silinebiliyor. Ödeme/abonelik geçmişi olan hesapların silinmesi, kayıt saklama ve destek süreci belirlenene kadar ayrıca inceleme gerektiriyor. |
| 10 | Hukuki metinler, iletişim ve çerezler | Eksik. Sayfalar hâlâ taslak. Gerçek veri sorumlusu/işletme ve destek bilgileri, gerçek veri işleme faaliyetlerine uygun metinler, reklam/çerez tercihleri tamamlanacak. Bilinmeyen işletme bilgisi uydurulmadı. |
| 11 | Topluluk yönetimi | Eksik. Şikâyet, moderasyonla içerik kaldırma ve kullanıcı engelleme araçları geliştirilecek; yönetici hesabı belirlenecek. |
| 12 | Premium ödeme | Satış güvenli biçimde kapalı tutuluyor. Butonlar Yakında gösteriyor, fatura formu açılmıyor, başlatma API'si 503 döndürüyor. Gerçek ödeme anahtarları, işletme/iadeler ve sağlayıcı testleri tamamlanmadan açılmayacak. |
| 13 | Yarış doğrulaması | Eksik. Bazı yarışlarda süre ve karakter sayısı istemciden geliyor. Sonuçlar güvenilir/resmî rekabet olarak sunulmadan önce sunucuda başlatılan deneme, süre ve metin doğrulaması, tekrar gönderim koruması tamamlanacak. Genel doğrulanmış sıralama zaten verified filtresi kullanıyor. |
| 14 | AdSense | Yayındaki ads.txt ve yayıncı kimliği kontrol edildi. Hesaptaki güncel inceleme durumu bu oturumda görülemedi; son kullanıcı bilgisi Hazırlanıyor. Google onayı ve ileride .com site kaydı gerekiyor. Gerçek reklam gösterimi veya gelir doğrulanmadı. |
| 15 | Kaynak, yedek ve izleme | Kaynak kodu ve bu kontrol raporu Git sürümüne alındı. İlk şifreli bulut veri yedeği alındı, ayrı yerel şemaya geri yüklenip bütün kayıtlar karşılaştırıldı. Vercel build/runtime günlükleri mevcut. Otomatik dış yedekleme, bildirimli hata takibi ve düzenli geri yükleme tatbikatı henüz kurulmadı. |

## Doğrulamalar

- Vercel Production derlemesi ve zorunlu ortam ayarı kontrolü başarılı.
- Bulut şeması ile Prisma modelleri bire bir eşleşti.
- Türkçe Q ve F için 100 farklı, kademeli ders müfredatı kontrolü başarılı.
- Hesap akışı yerelde ve gerçek canlı adreste başarılı.
- Hesap güncellemede yetki/kimlik alanları kabul edilmiyor; başka kaynaktan gelen istek reddediliyor.
- Hesap silmede yanlış parola ve yanlış onay reddediliyor; ödeme geçmişi korunuyor.
- 13 genel sayfa/ads.txt HTTP 200; kapalı ödeme API'si beklenen 503 sonucunu veriyor.
- Haftalık sınav takvimi üç sunucu saat diliminde aynı İstanbul hafta sınırını üretiyor.
- Şifreli yedekteki bütün tablolar geçici yerel şemaya geri yüklendi; kayıtlar bire bir eşleşti.

## Günlük kullanım ve dağıtım

Yerel geliştirme: npm run dev

Yerel ortam kontrolü: npm run check:env

Ortam ve ödeme korumaları: npm run check:launch

Migration uygulama: npm run db:deploy (hedef DATABASE_URL ortamı önceden doğrulanmalı).

Ders güncelleme: npm run db:update-lessons. Bu komut mevcut ders kimliklerini, ilerlemeleri, yayın ve erişim tercihlerini korur. Mevcut kullanıcı verisi olan veritabanına ilk kurulum seed'ini gelişigüzel uygulamayın.

Vercel build komutu vercel.json ile npm run build:production olarak tanımlı. Eksik anahtarlar ve localhost Production adresi derlemeden önce engellenir. Ortam değerleri kaynak koda yazılmaz.

.env ve .vercel klasörü hem Git'ten hem dağıtımdan hariçtir. .env.example yalnızca şablondur. Production sensitive değerler env pull çıktısında [SENSITIVE] görünebilir; bu yer tutucular gerçek anahtar değildir ve canlı ayarlar üzerine yazılmamalıdır.

Ödeme ancak PAYMENTS_ENABLED=true ve PAYMENT_PROVIDER=iyzico ile, gerekli sağlayıcı anahtarları mevcutsa etkinleşir. Şimdilik kapalı bırakılmalı. Ödeme sonuç callback'i mevcut işlemlerin doğrulanabilmesi için korunmuştur.

## Yedek

İlk doğrulanmış yedek: .vercel/backups/2026-10-26T05-28-58-622Z.hpbackup

Anahtar: .vercel/backup.key. Anahtarı kaynak depoya veya sohbet mesajına koymayın. Yedeğin kullanılabilmesi için anahtarın da korunması gerekir; ayrı, erişimi kısıtlı bir yerde kopyası tutulmalı.

Yedek komutu:

    npm run db:backup -- --source-env .vercel/.env.production.local --key-file .vercel/backup.key --verify-local

Komut, tek tutarlı işlemde tüm Prisma tablolarının veri anlık görüntüsünü alır, AES-256-GCM ile şifreler ve dosyayı okuyarak doğrular. --verify-local seçeneği şifreli dosyayı çözüp verileri sadece localhost üzerinde benzersiz geçici bir şemaya geri yükler. Mevcut yerel uygulama şemasına dokunmaz. Veri modeli değişince yedek bağımlılık sırası da güncellenmelidir. Bu uygulama veri yedeğidir; PostgreSQL rol/izin veya sağlayıcı ayarlarının tam sunucu yedeği değildir. Düzenli uzak yedek ve otomatik zamanlama henüz yoktur.

## Sonraki çalışma sırası

1. E-posta gönderim hizmeti ve doğrulanmış gönderici kur; parola sıfırlama/e-posta doğrulama akışlarını geliştir.
2. Gerçek destek ve işletme bilgilerini belirle; iletişim, hukuki metinler ve çerez tercihlerini tamamla.
3. Topluluk moderasyon araçlarını ve yönetici erişimini tamamla.
4. Yarış skorlarını sunucuda doğrula.
5. Seçilen .com adresini satın alıp DNS/HTTPS/yönlendirmeleri bağla; site adresini güncelle.
6. AdSense'e yeni alan adını ekle ve Google incelemesini tamamla.
7. Otomatik yedekleme ve hatalarda bildirim kurulumu yap; yayımdan sonra hesap akışlarını yeniden test et.

Ödeme açılacaksa, sağlayıcı canlı testleri ve işletme süreçleri ayrıca tamamlanmalıdır.
