# HızlıParmak — geliştirme başlangıç projesi

Next.js + TypeScript + Prisma + PostgreSQL tabanlı klavye eğitim platformu iskeleti.

## Gereksinimler

- Node.js 20.9 veya üstü
- npm
- PostgreSQL 15+ (yerel kurulum veya yönetilen veritabanı)

## Kurulum

1. Projeyi açıp bağımlılıkları yükle:

   ```bash
   npm install
   ```

2. `.env.example` dosyasını `.env` adıyla kopyala ve `DATABASE_URL` ile `AUTH_SECRET` değerlerini düzenle. `AUTH_SECRET` için uzun ve rastgele bir değer kullan. Gerçek sırları Git'e gönderme.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

3. PostgreSQL'de `hizliparmak` adlı veritabanını oluştur. Ardından:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. Geliştirme sunucusunu başlat:

   ```bash
   npm run dev
   ```

5. `http://localhost:3000` adresini aç.

## Veritabanı yönetimi

- `npm run db:studio` — Prisma Studio
- `npm run db:seed` — 100 başlangıç dersi, iki plan ve başarımlar
- Şema değişikliklerinde `npx prisma migrate dev --name degisiklik_adi`

## Mevcut durum

- Ana sayfa, kayıt ve giriş API'leri, imzalı HTTP-only oturum çerezi
- PostgreSQL/Prisma veri modeli
- 100 aşamalı ders verisi için seed
- Öğrenme merkezi, örnek ders ekranı ve istemci tarafında çalışan temel yazma testi
- Dashboard, gelişim sayfası, genel sıralama görünümü
- Premium, ödeme için güvenli başlangıç ekranı ve yönetim sayfaları
- Profil, klavye tercihi, gizlilik ve bilgilendirme sayfalarının başlangıç sürümleri

## Henüz üretime hazır olmayan alanlar

- Ödeme sağlayıcısı entegrasyonu ve imza doğrulamalı webhook
- E-posta doğrulama ve parola sıfırlama akışları
- Ders tamamlamanın sunucu tarafında doğrulanması ve ilerleme kaydı
- Yarışlar/arkadaşlıklar için işlem API'leri ve canlı eşleştirme
- Yöneticiye güvenli rol atama prosedürü ve içerik düzenleme formları
- Hesap silme, veri dışa aktarma ve tam KVKK/çerez süreçleri
- Reklam sağlayıcısı ve analitik entegrasyonu
- Üretim testi, hız sınırları, güvenlik incelemesi ve erişilebilirlik denetimi

Bu nedenle bu depo bir **başlangıç/MVP iskeletidir**, henüz gerçek ödeme alacak veya üretime açılacak tamamlanmış bir ticari ürün değildir. Ödeme kart bilgilerini uygulamaya eklemeyin. Yönetici hesabı rolünü yalnızca güvenli, kontrollü bir veritabanı işlemiyle atayın.
