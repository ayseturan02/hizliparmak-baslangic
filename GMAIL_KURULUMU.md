# Gmail gönderimini etkinleştirme

Seçilen gönderici: ayse0025turan@gmail.com.

Kod Gmail SMTP üzerinden TLS ile gönderim yapacak şekilde hazırlanmıştır. Uygulama şifresi olmadan gönderim kapalı kalır. Normal Gmail parolası kullanılmaz. Gizli değerler kaynak koda, bu belgeye veya sohbet mesajına yazılmamalıdır.

1. Gönderici Google hesabında iki adımlı doğrulamayı aç: https://myaccount.google.com/security .
2. https://myaccount.google.com/apppasswords adresinde HızlıParmak adıyla bir uygulama şifresi oluştur. Bu işlem hesap sahibinin Google oturumunda yapılmalıdır.
3. Vercel projesinin Production ortamında `GMAIL_APP_PASSWORD` isimli gizli ortam değişkenine 16 karakterlik uygulama şifresini gir. Google'ın gösterdiği gruplar arasındaki boşluklar kod tarafından temizlenir. Şifreyi bu belgeye veya sohbete koyma.
4. Production ortamındaki `EMAIL_PROVIDER=gmail` ve `GMAIL_USER=ayse0025turan@gmail.com` ayarlarıyla yeniden yayımla. Gönderici adı HızlıParmak, adres SMTP hesabının kendisidir.
5. Sahibinin eriştiği gerçek bir test hesabıyla parola sıfırlama isteği yap; gelen kutusu/spam, bağlantının açılması, parolanın değişmesi ve eski bağlantının tekrar kullanılamaması doğrulanmalıdır. API'nin isteği kabul etmesi tek başına posta teslimatı değildir.

Vercel ayarları: https://vercel.com/ayse-turans-projects/hizliparmak-baslangic/settings/environment-variables

Google uygulama şifresi sayfası görünmüyorsa iki adımlı doğrulama durumunu kontrol et. Bazı hesap koruma türleri veya kuruluş politikaları uygulama şifresini kapatabilir.

Gmail gönderim sınırlamaları ve Google'ın bağlantıyı engellemesi gerçek canlı testte değerlendirilmelidir; yüksek hacimli kullanım için özel gönderim hizmetine geçiş gerekebilir. Resend adaptörü `EMAIL_PROVIDER=resend` ile korunur.

Kaynaklar:
- https://support.google.com/accounts/answer/185833?hl=tr
- https://nodemailer.com/guides/using-gmail
- https://vercel.com/kb/guide/serverless-functions-and-smtp
