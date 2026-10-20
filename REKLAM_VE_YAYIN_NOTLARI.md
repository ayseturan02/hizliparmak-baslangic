# Reklam ve sohbet güncellemesi

- Sayfaları kaplayan üst/yan/alt/footer reklam kutuları kaldırıldı.
- Gerçek reklamlar henüz etkin değil: AdSlot, AdSense istemci/birim kimlikleri yoksa **hiçbir boş kutu çizmez**. Sadece ortam değişkeni tanımlamak da reklam yayını başlatmaz; AdSense onayı ve politika uyumlu reklam birimi entegrasyonu ayrıca yapılmalıdır.
- Sohbet gönderiminden sonra `scrollIntoView()` kaldırıldı. Artık kaydırma yalnızca sohbet mesajlarının kendi panelinde yapılır; kullanıcı eski mesajları okuyorsa 7 saniyelik yenileme onu aşağı çekmez.
- `npm install`, `npm run build` ve yerel/girişli sohbet işlev testlerini çalıştırın.
- .env dosyanızı ZIP'e eklemeyin.
