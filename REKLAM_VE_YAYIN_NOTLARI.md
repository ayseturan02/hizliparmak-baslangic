# HızlıParmak güncellemesi
- Üst, alt, footer ve geniş ekranda iki yan reklam yer tutucusu eklendi. Bunlar gerçek reklam DEĞİLDİR. AdSense onayı sonrası yayın kodu ayrıca bağlanmalıdır.
- Premium abonelikte reklam yer tutucuları gizlenir.
- Giriş ve kayıt ekranlarında şifre göster/gizle düğmesi eklendi.
- 100 seviye için farklı ve giderek uzayan özgün çalışma metni üretimi eklendi. ÖNEMLİ: Mevcut veritabanındaki dersleri otomatik güncellemez; seed kodu yeni ders oluşturulurken kullanılır. Mevcut dersler için ayrı veri güncelleme planı gerekir.
- Sohbet: Enter ile gönderme, Shift+Enter ile satır, @ kullanıcı önerisi ve alıntılı yanıt (mesaj gövdesinde alıntı) eklendi. Kalıcı reply ilişkisi için ileride şema değişikliği önerilir.
- Yayına almadan önce: npm ci, npx prisma generate, npx tsc --noEmit, npm run build ve uçtan uca testler yapılmalıdır. Bu ortamda bağımlılık kurulumu zaman aşımına uğradığından derleme doğrulanamadı.
- Reklamları giriş/kayıt ve yoğun etkileşim alanlarında göstermenin AdSense politikaları ve kullanıcı deneyimi bakımından uygunluğunu yayın öncesi değerlendirin.
