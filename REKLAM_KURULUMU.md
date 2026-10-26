# Gerçek AdSense reklamları

Yayıncı kimliği: ca-pub-6823236945712938

Kod, yayıncı kimliğiyle AdSense Auto ads betiğini hydration sonrasında yükler. Auto ads için reklam birimi (data-ad-slot) gerekmez. HızlıParmak tanıtım kartları gösterilmez.

## Yayın hesabında tamamlanacaklar

1. Siteyi gerçek, herkese açık alan adında yayınla.
2. AdSense > Siteler bölümüne alan adını ekle; site incelemesi tamamlanıp durum Hazır olmalı.
3. AdSense > Reklamlar > Siteyi düzenle bölümünde Otomatik reklamlar seçeneğini aç ve Siteye uygula.
4. Rahatsız etmeyen görünüm için reklam yükünü düşük tut; sabit reklamlar ve tam ekran geçiş reklamlarını kapat. Önizlemede ana sayfanın üst/hero alanını hariç tut.
5. Giriş, kayıt, yönetim ve ödeme sayfalarını reklam hesabında da sayfa hariç tutma listesine ekle. Kullanıcıya özel Premium ayrımı kodda korunur.
6. /ads.txt adresinin HTTP 200 ile yayıncı satırını verdiğini kontrol et.

Reklamverenleri (ör. Trendyol), reklamları ve gelir miktarını Google belirler. Hesap/site onayı ve reklam doluluğu koddan garanti edilemez. Localhost görünümü gerçek yayın reklamlarının başladığını doğrulamaz.

## Elle yerleştirilen sağ/sol reklamlar

AdSense > Reklam birimine göre bölümünden duyarlı görüntülü reklam birimi oluştur. Koddaki data-ad-slot değerini NEXT_PUBLIC_ADSENSE_SLOT alanına veya _TOP, _SIDE, _CONTENT, _BOTTOM ekli alanlara gir. Örnek kimlikler kabul edilmez. Yerel sunucuyu yeniden başlat; canlı yayında değişikliği yeniden yayınla.

Geçerli birim kimliği yoksa elle yerleştirilmiş boş kutular gösterilmez. Auto ads bu kimlikten bağımsız olarak yayıncı koduyla çalışır. Reklamlar tıklama için otomatik yenilenmez ve üretim reklamlarına test tıklaması yapılmaz.

Kaynaklar:
- https://support.google.com/adsense/answer/9261307?hl=tr
- https://support.google.com/adsense/answer/7584263?hl=tr
- https://support.google.com/adsense/answer/12171612?hl=tr
