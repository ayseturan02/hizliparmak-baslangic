export const SECTION_NAMES = ["Tuşları tanı ve parmaklarını yerleştir", "Hecelerden kelimelere", "Büyük harf, noktalama ve sayılar", "Akıcı okuma ve yazma", "Uzun metin ve sınav hazırlığı"];
export type LessonLayout = "TR" | "F";
const qKeys = ["fj", "dk", "fdjk", "sl", "aş", "asdfjklş", "gh", "asdfghjklş", "eı", "ru", "ty", "wo", "qp", "ğü", "qwertyuıopğü", "cm", "vn", "bx", "zöç", "içöüğşabcçdefgğhıijklmnoöprsştuüvyzqwx"];
const fKeys = ["ak", "em", "aekm", "il", "uy", "uieakmly", "üt", "uieaütkmly", "ğn", "ır", "od", "gh", "fp", "qw", "şx", "vs", "cz", "çö", "jb", "fgğıodrnhpqwuieaütkmlyşxjövcçzsb"];
const wordLessons = [
 ["Açık heceler", "al el il ol öl ul ül ar er ir or ör ur ür"],
 ["Kapalı heceler", "la le li lı lo lö lu lü ra re ri rı ro rö ru rü"],
 ["Dudak ve dil heceleri", "ba be bi bı bo bö bu bü da de di dı do dö du dü"],
 ["Türkçe sesler", "ça çe çi ço çö çu çü şa şe şi şı şu şü ğa ğe ğı ğu ğü"],
 ["Kısa kelimeler", "el al at et ot ev su ay gün yol ses söz yaz göz yüz taş"],
 ["Temel sıra kelimeleri", "ada akıl asal el ele kale kask dal sal şal kal aşka şaka"],
 ["İki heceli kelimeler", "kalem kitap masa kapı sıra okul bilgi güneş deniz bahçe"],
 ["Üç heceli kelimeler", "kelebek pencere çalışma arkadaş düzenli başarılı dikkatli"],
 ["İnce ve kalın sesler", "ılık ışık ırmak kırık minik çizgi ince bilgi kıyı kişi"],
 ["Noktalı Türkçe harfler", "çiçek çocuk çanta gölge güneş gümüş şeker şehir öğrenci"],
 ["Yumuşak geçişler", "ağaç yağmur dağ bağ doğru öğle soğuk sağlıklı uğraş"],
 ["Çift harfli kelimeler", "anne belli dikkat hatta hissetmek kuvvet millet sessiz"],
 ["Benzer kelimeleri ayırt et", "kal kel kol kul gül göl gün dün tel ten taş baş yaş"],
 ["Uzayan kelimeler", "yaz yazı yazıcı yazmak yazmakta yazdıklarım yazabileceklerim"],
 ["Kısa söz grupları", "el ele açık kapı yeni kalem temiz masa doğru tuş sakin adım"],
 ["Sıfat ve isim birlikteliği", "mavi defter küçük bahçe düzenli masa sıcak çay uzun yol"],
 ["Fiillerle ritim", "oku yaz dinle düşün öğren dene tekrarla düzelt tamamla ilerle"],
 ["Basit cümleler", "ali kalem al ela kitap oku yeni bir ders aç sakin ve doğru yaz"],
 ["Kelime geçişleri", "her yeni kelime parmakların arasında farklı bir yol açar acele etmeden bu yolu öğren"],
 ["Küçük paragraf", "bugün ellerimi temel sıraya yerleştirdim önce kısa heceleri yazdım sonra kelimelere geçtim her satırda biraz daha rahat çalıştım"]
];
const symbolLessons = [
 ["Büyük harfle başla", "Ali Ela Oya Can Deniz Ece. Ali kitap okur. Ece yeni bir kalem alır."],
 ["Türkçe büyük harfler", "I ı İ i Ç ç Ğ ğ Ö ö Ş ş Ü ü. Işık, İpek, Çınar, Öykü ve Şule aynı sınıfta."],
 ["Cümle sonu noktası", "Masa hazır. Defter açık. Ellerim rahat. Gözlerim ekranda. Her satırı dikkatle yazıyorum."],
 ["Virgülle ayır", "Kalem, defter, silgi ve cetvel masada duruyor. Önce oku, sonra yaz, sonunda kontrol et."],
 ["Soru cümleleri", "Bugün hangi tuşu öğrendin? Hangi parmağın zorlanıyor? Kısa bir ara vermek ister misin?"],
 ["İki nokta ve noktalı virgül", "Çalışma planı: tekrar, ders ve test. İlk turda yavaş yaz; ikinci turda ritmini koru."],
 ["Parantez ve ünlem", "Duruşunu kontrol et (omuzlar rahat, bilekler düz). Hazırsan başla! Her deneme yeni bir fırsat."],
 ["Kesme işareti", "Ankara'da bir eğitim düzenlendi. Ayşe'nin defteri masadaydı. Türkiye'nin farklı illerinden adaylar geldi."],
 ["Rakam sırası", "11 22 33 44 55 66 77 88 99 00 12 34 56 78 90 09 87 65 43 21"],
 ["Sayı ve kelime", "1 kalem, 2 defter, 3 dosya, 4 kitap, 5 klasör. Bugün 10 dakika çalıştım, 20 kelimeyi tekrarladım."],
 ["Tarih yazımı", "Tarih alıştırması: 05.01.2026, 18.03.2026 ve 29.10.2026. Dosyalar 12/04/2026 tarihinde sıralandı."],
 ["Saat yazımı", "Çalışma 09:15'te başladı. İlk ara 09:35'te verildi. İkinci bölüm 10:00'da açıldı ve 10:25'te tamamlandı."],
 ["Ondalık ve yüzde", "Birinci ölçüm: 24,5 kelime. İkinci ölçüm: 28,75 kelime. Doğruluk oranı %96,5; hedef ise %98."],
 ["Numaralı liste", "1. Masanı düzenle. 2. Ellerini yerleştir. 3. Metni oku. 4. Yavaşça yaz. 5. Sonucunu incele."],
 ["Adres ve kısa bilgi", "Örnek adres: Eğitim Sokak, No: 12, Kat: 3. Oda 204. Başvuru kodu: A-125. Bu bilgiler alıştırma içindir."],
 ["Tırnak içindeki söz", "Eğitmen, 'Önce doğruluk, sonra hız' dedi. Aday, 'Bugün biraz daha dikkatli çalışacağım' diye yanıt verdi."],
 ["Karışık Türkçe kelimeler", "İş bölümü, ölçülü çalışma, açık iletişim ve güçlü dikkat; düzenli bir hazırlığın parçalarıdır."],
 ["Kısa duyuru", "DUYURU: Yarın saat 10:30'da ortak çalışma yapılacak. Yanınızda 1 defter bulundurun. Katılım ücretsizdir."],
 ["Not ve karşılaştırma", "İlk gün: 18 kelime, %92 doğruluk. Üçüncü gün: 21 kelime, %95 doğruluk. Not: Hız artarken hataları azalt."],
 ["Noktalama genel tekrarı", "Hazır mısın? Tarih: 15.06.2026. Saat: 14:20. Planımız açık: metni oku, sakin yaz; son satırı da kontrol et!"]
];
// Original practice passages, written for this curriculum (not copied exam texts).
const passages = [
 ["Sessiz çalışma alanı", "Sabah çalışma masamı düzenledim. Gereksiz eşyaları kaldırıp defterimi yanıma koydum. Ekranı göz hizama getirdim ve omuzlarımı serbest bıraktım. Kısa bir hazırlığın ardından ilk satırı acele etmeden yazmaya başladım."],
 ["Dikkatli okuma", "Bir metni yazmadan önce anlamını kavramaya çalışırım. Kelimelerin sırasını ve cümlelerin sonundaki işaretleri gözden geçiririm. Böylece parmaklarım bir sonraki hareket için hazırlanır. Dikkatim dağıldığında hızlanmak yerine kısa bir süre yavaşlarım."],
 ["Kütüphanede bir gün", "Mahalle kütüphanesinde pencerenin yanında küçük bir masa vardı. Raflardaki kitaplar konularına göre ayrılmıştı. Görevli, aradığım kitabı bulmam için katalogdan yararlandı. Kitabı aldıktan sonra okuma salonunda sessizce not tuttum."],
 ["Yağmurdan sonra", "Gece yağan yağmur sabah yerini açık bir gökyüzüne bıraktı. Bahçedeki yaprakların üzerinde ince su damlaları duruyordu. Sokaktan geçen insanlar serin havanın tadını çıkarıyordu. Ben de kısa bir yürüyüşün ardından günlük çalışmama döndüm."],
 ["Küçük bir plan", "Günün başında yapılacak işleri kısa bir listeye yazdım. Kolay görevlerle zor görevleri birbirinden ayırdım. Her işin yanına yaklaşık bir süre ekledim. Listeyi tamamlamak için acele etmedim; önemli olan, dikkatimi tek bir işe verebilmekti."],
 ["Yeni bir beceri", "Yeni bir beceri öğrenirken ilk denemeler bazen yavaş ilerler. Elimiz alıştıkça hareketler daha doğal bir hâl alır. Küçük hatalar hangi noktayı tekrar etmemiz gerektiğini gösterir. Düzenli çalışma, bu sürecin en güvenilir eşlikçisidir."],
 ["Birlikte hazırlık", "Üç arkadaş aynı hedef için haftada bir kez buluşuyordu. Önce kısa bir metin üzerinde çalışıyor, ardından sonuçlarını konuşuyorlardı. Herkes zorlandığı tuşları açıkça paylaşıyordu. Birbirleriyle yarışmaktan çok, birbirlerine yardımcı olmaya önem veriyorlardı."],
 ["Dijital düzen", "Bilgisayardaki dosyalarımı anlaşılır adlarla kaydetmeye başladım. Her konu için ayrı bir klasör oluşturdum. Eski kopyaları dikkatle inceleyip gereksiz tekrarları ayırdım. Düzenli bir çalışma alanı, aradığım belgeye daha kolay ulaşmamı sağladı."],
 ["Zamanın değeri", "Bir işi bitirmek için yalnızca uzun süre ayırmak yeterli değildir. Dikkatin ne kadar süre korunabildiği de önemlidir. Kısa ama odaklı çalışma aralıkları bu nedenle yararlı olabilir. Ben kendi ritmimi tanımak için her denemeden sonra küçük notlar alıyorum."],
 ["İletişimde açıklık", "Bir bilgi paylaşırken kısa ve anlaşılır cümleler kurmaya özen gösteririm. Karşımdaki kişinin sorusunu sonuna kadar dinlerim. Bilmediğim bir konu olduğunda bunu açıkça belirtirim. Sağlıklı iletişimin temelinde dikkat, saygı ve açıklık bulunduğuna inanırım."],
 ["Belgeyi gözden geçirmek", "Örnek bir belgeyi teslim etmeden önce başlığını kontrol ettim. Tarih ve sayı alanlarının doğru yerde olup olmadığına baktım. Yazım yanlışlarını ayrı bir turda inceledim. Son olarak metni baştan sona okuyarak eksik bir satır kalmadığından emin oldum."],
 ["Ulaşımda sakinlik", "Otobüs durağına birkaç dakika erken vardım. Yolculuk sırasında günlük notlarımı gözden geçirdim. Kalabalık bir ortamda bile sakin kalmak, günün başlangıcını kolaylaştırıyordu. Gideceğim yere ulaştığımda önümdeki işleri sırayla ele almaya hazırdım."],
 ["Ders sonu değerlendirmesi", "Bugünkü çalışmada bazı kelimeleri önceki güne göre daha rahat yazdım. Buna karşılık, benzer harflerin art arda geldiği bölümlerde yavaşladım. Bu gözlemimi defterime kaydettim. Bir sonraki derste aynı hareketleri kısa tekrarlarla güçlendirmeye karar verdim."],
 ["Sağlam bir alışkanlık", "Her akşam aynı saatte masama oturmak başlangıçta zor geliyordu. Zamanla bu küçük düzen günlük hayatımın doğal bir parçası oldu. Çalışma süresini gereksiz yere uzatmadan devam ettim. Bir alışkanlığın gücünü, uzunluğundan çok sürdürülebilirliğinde buldum."],
 ["Doğru soruyu sormak", "Bir konuda zorlandığımda önce tam olarak nerede takıldığımı belirlerim. Sorumu açıkça ifade etmek, çözüm aramayı kolaylaştırır. Aldığım yanıtı küçük bir denemeyle sınarım. Sonuç beklediğim gibi değilse soruyu yeniden düşünür ve başka bir yol ararım."],
 ["Şehirde sabah", "Şehrin sokakları güne yavaşça hazırlanıyordu. Fırından yeni çıkan ekmeklerin kokusu kaldırıma yayılmıştı. Esnaf dükkânının önünü temizlerken öğrenciler okula doğru yürüyordu. Bu sıradan görüntüler, yeni bir güne başlamanın sakin heyecanını taşıyordu."],
 ["Notları sınıflandırmak", "Bir haftalık çalışma notlarını masanın üzerine yaydım. Tekrar gerektiren konuları bir grupta topladım. Tamamladığım konuların yanına küçük bir işaret koydum. Böylece yeni haftanın planını hazırlarken hangi noktaya ağırlık vermem gerektiğini açıkça gördüm."],
 ["Kısa bir mola", "Uzun bir paragrafın ardından gözlerimi ekrandan ayırdım. Pencerenin dışındaki uzak bir noktaya baktım ve ellerimi dinlendirdim. Masama döndüğümde önce oturuşumu kontrol ettim. Sonraki satıra, önceki hataları düşünmek yerine yeni bir dikkatle başladım."],
 ["Gönüllü bir görev", "Mahalledeki okuma etkinliği için küçük bir liste hazırlandı. Katılımcılar kitapları ayırma, masaları düzenleme ve gelenleri karşılama işlerini paylaştı. Her görev tamamlandıkça liste güncellendi. Ortak emek sayesinde hazırlıklar planlanan saatte sona erdi."],
 ["Akıcılık çalışması", "Bu paragrafta amacım tek bir kelimede gereksiz yere durmamaktır. Gözlerim metni izlerken ellerim sakin bir ritimle hareket eder. Yanlış bir tuşa bastığımda durumu fark eder ve kontrollü biçimde düzeltirim. Akıcı yazmanın temelinde dikkatli tekrar bulunduğunu unutmam."],
 ["Örnek tutanak hazırlığı", "Bu çalışma metni, belge yazma pratiği için hazırlanmış kurgusal bir örnektir. Eğitim salonunda yapılan toplantı saat 09:30'da başladı. Katılımcılar önce gündem başlıklarını okudu ve görüşlerini sırayla paylaştı. Notları tutan görevli, konuşmaları anlaşılır cümlelerle kaydetti. Toplantı sonunda tarih, saat ve katılımcı adları tekrar kontrol edildi. Eksik görülen bölümler tamamlanarak örnek metin son kez gözden geçirildi."],
 ["Arşiv çalışması", "Arşivdeki dosyaları inceleyen ekip, önce bir çalışma planı oluşturdu. Her dosyaya geçici bir sıra numarası verildi. Belge adları, tarihleri ve konu başlıkları ayrı sütunlara yazıldı. Okunamayan alanlar tahmin edilmedi; daha sonra incelenmek üzere işaretlendi. Günün sonunda kayıtlar karşılaştırıldı ve tekrarlanan satırlar belirlendi. Dikkatli bir düzenleme, sonraki aşamadaki aramaları kolaylaştırdı."],
 ["Danışma masası", "Sabah danışma masasında sakin bir hazırlık vardı. Görevli, başvuru yapmak isteyen kişilerin sorularını dikkatle dinliyordu. Bir ziyaretçi hangi evrakı nereden alacağını öğrenmek istedi. Görevli, kendi bildiği sınırlar içinde açık bir yönlendirme yaptı. Ayrıntılı bilgi gerektiren konular için ilgili birime başvurulmasını önerdi. İletişim boyunca kısa cümleler ve anlaşılır ifadeler kullanmaya özen gösterildi."],
 ["Örnek dilekçe kontrolü", "Eğitim amacıyla hazırlanmış dilekçenin başlığı masanın üzerindeki örnekle karşılaştırıldı. Metinde geçen ad, tarih ve iletişim alanları tek tek incelendi. Anlatılmak istenen konunun açık olup olmadığı değerlendirildi. Gereksiz tekrarlar çıkarıldı; anlamı değiştirecek bir ekleme yapılmadı. Son bölümde imza için ayrılan alanın bulunduğu görüldü. Bu alıştırmada amaç, bir belgeyi dikkatle okuyup yazıya geçirme alışkanlığı kazanmaktı."],
 ["Ekip içi görev dağılımı", "Küçük bir proje için dört kişilik bir ekip bir araya geldi. İlk görüşmede işlerin kapsamı ve teslim sırası konuşuldu. Herkes yapabileceği görevleri ve ihtiyaç duyduğu desteği açıkladı. Ortak dosyada anlaşılır bir görev listesi tutuldu. Beklenmedik bir durum ortaya çıktığında plan birlikte gözden geçirildi. Ekip, birbirini haberdar ederek çalışmanın düzenini korumaya özen gösterdi."],
 ["Eğitim takvimi", "Örnek eğitim takviminde pazartesi günü temel tuş tekrarına ayrılmıştı. Salı günü kelime çalışmaları, çarşamba günü ise noktalama alıştırmaları yapılacaktı. Perşembe saat 14:15'te kısa bir deneme planlandı. Cuma günü sonuçların değerlendirilmesi için ortak bir görüşme ayrıldı. Katılımcılar takvimi kendi çalışma hızlarına göre uyarlayabileceklerini biliyordu. Amaç, sıkı bir yarıştan önce sürdürülebilir bir öğrenme düzeni kurmaktı."],
 ["Bilgiyi doğrulama", "Bir duyuruyu okuduğumuzda önce kaynağını incelemek önemlidir. Başlık tek başına bütün ayrıntıları anlatmayabilir. Metnin tarihi, kapsamı ve varsa güncellemeleri birlikte değerlendirilmelidir. Eksik bir bilgiyi tahminle tamamlamak yerine ilgili açıklamaya dönmek daha sağlıklı olur. Bu örnek çalışmada adaylar birbirinden farklı üç kısa duyuruyu karşılaştırdı. Sonuçlarını yazarken kesin olarak gördükleri bilgilerle kendi yorumlarını ayırmaya dikkat ettiler."],
 ["Örnek toplantı gündemi", "Gündemin ilk maddesi geçen haftaki çalışmaların değerlendirilmesiydi. İkinci maddede yeni görevlerin sırası konuşuldu. Üçüncü bölümde ortak klasörlerin adlandırılması için bir öneri sunuldu. Katılımcılardan biri, dosya isimlerinde tarih bilgisinin de bulunmasını istedi. Görüşler kısa notlar hâlinde kaydedildi. Son bölümde bir sonraki görüşmenin saati belirlendi ve herkes kendi notlarını gözden geçirdi."],
 ["Yoğun bir günün planı", "Günlük listemde birbirinden farklı altı iş bulunuyordu. Önce zaman sınırı olan görevleri belirledim ve gerekli belgeleri hazırladım. Daha sonra benzer işleri aynı çalışma aralığında topladım. Her görevin ardından tamamlanan bölüme küçük bir işaret koydum. Plan dışı bir durum çıktığında bütün listeyi bırakmak yerine sırayı yeniden düzenledim. Gün sonunda kalan işleri açık biçimde not ederek ertesi güne hazırlık yaptım."],
 ["Sınav öncesi hazırlık", "Deneme başlamadan önce klavye düzenimi ve oturuşumu kontrol ettim. Parmaklarımı temel sıraya yerleştirip kısa bir ısınma yaptım. Metnin ilk cümlesini dikkatle okudum ve noktalama işaretlerine göz gezdirdim. Geri sayım bittiğinde acele etmek yerine alıştığım ritimle başladım. Zor bir kelime karşıma çıktığında ellerimi gereksiz yere kasmadım. Bu denemede temel hedefim, son satıra kadar dikkatimi koruyabilmekti."],
 ["Kayıt çizelgesi", "Eğitim grubunun örnek kayıt çizelgesinde 12 satır bulunuyordu. Her satırda bir katılımcı kodu, çalışma tarihi ve kısa bir not yer alıyordu. Kodlar A-101 ile başlayıp sırayla devam ediyordu. Kontrol sırasında bir tarihin eksik yazıldığı fark edildi. Eksik bilgi tamamlanmadan önce ilgili not yeniden incelendi. Çizelge son hâlini aldığında sayıların ve başlıkların hizası da gözden geçirildi."],
 ["Dosya teslim hazırlığı", "Teslim edilecek örnek dosyanın içeriği bir kontrol listesine göre incelendi. Başlık sayfası, ekler ve açıklama notları ayrı ayrı değerlendirildi. Belgelerin sırası değiştirilmeden önce mevcut düzen not edildi. Yeni bir sayfa eklendiğinde listenin de güncellenmesine dikkat edildi. Son kontrolde eksik veya tekrarlanan sayfalar arandı. Bu alıştırma, yazma hızından bağımsız olarak dikkatli takip alışkanlığını güçlendirmek için yapıldı."],
 ["Ortak çalışma odası", "Çalışma odasında herkesin rahatça kullanabileceği bir alan ayrılmıştı. Masalar ışığı doğrudan ekrana yansıtmayacak biçimde yerleştirildi. Ortak kullanılan araçların yerleri küçük etiketlerle belirtildi. Katılımcılar kısa molalarda birbirlerini rahatsız etmemeye özen gösterdi. Günün sonunda her kişi kendi masasını düzenleyip kullandığı malzemeyi yerine koydu. Düzenin korunması, ertesi günkü çalışmaya sakin bir başlangıç sağladı."],
 ["Örnek görüşme notları", "Görüşmenin başında konuşulacak konular kısa bir listeyle paylaşıldı. Not tutan kişi, her başlığın altına yalnızca ilgili bilgileri yazdı. Anlamı açık olmayan bir ifade duyduğunda açıklama istedi. Kendi yorumunu konuşmacının sözüymüş gibi kaydetmemeye dikkat etti. Görüşme bittiğinde alınan notlar sırayla okundu. Gereken düzeltmeler yapıldıktan sonra dosyaya tarih ve konu bilgisi eklendi."],
 ["Dikkati yeniden toplamak", "Uzun bir çalışma sırasında düşüncelerimin metinden uzaklaştığını fark ettim. Önce ellerimi durdurup ekrandaki son doğru kelimeyi buldum. Birkaç sakin nefesin ardından oturuşumu yeniden ayarladım. Devam ederken hızımı biraz düşürdüm ve kısa bir bölüm seçtim. Bu bölüm tamamlanınca dikkatim yeniden daha düzenli hâle geldi. Her denemenin aynı hızda geçmek zorunda olmadığını kendime hatırlattım."],
 ["Örnek yazışma taslağı", "Taslağın konusu, gelecek haftaki eğitim programının paylaşılmasıydı. Giriş bölümünde toplantının amacı kısa bir cümleyle anlatıldı. Sonraki paragrafta gün, saat ve yer bilgileri sıralandı. Katılımcılardan hangi hazırlıkları yapmalarının beklendiği açıkça belirtildi. Metin tamamlanınca tarihlerin birbiriyle tutarlı olup olmadığı kontrol edildi. Yazışmanın bütünü, gereksiz ayrıntılar çıkarılarak daha anlaşılır bir hâle getirildi."],
 ["Üç dakikalık deneme", "Sayaç 03:00 değerini gösterirken gözlerimi ilk satıra çevirdim. Başlangıçta hızlanmak yerine her kelimeyi doğru yazmaya odaklandım. Bir virgülü atladığımı fark edince metni dikkatle izlemeye devam ettim. Sürenin ortasında omuzlarımın rahat olduğundan emin oldum. Son bölümde kalan zamanı düşünmek yerine önümdeki kelimelere yoğunlaştım. Deneme sonunda yalnızca toplam sayıya değil, hangi hataları yaptığımı gösteren notlara da baktım."],
 ["Sonuçları karşılaştırmak", "Bu haftanın sonuçlarını geçen haftaki kayıtlarla yan yana koydum. Bazı günlerde hızım yükselmiş, bazı günlerde doğruluğum artmıştı. Tek bir yüksek değere bakarak karar vermek istemedim. Bunun yerine çalışma süremi, dinlenme aralıklarımı ve zorlandığım harfleri birlikte inceledim. Notlarımda özellikle noktalama geçişlerinin daha fazla tekrar istediği görülüyordu. Yeni planı hazırlarken bu gözlemi küçük ve uygulanabilir bir hedefe dönüştürdüm."],
 ["Dengeli çalışma", "Dersler ilerledikçe uzun metinleri daha rahat yazmaya başladım. Yine de temel tuş alıştırmalarını tamamen bırakmadım. Kısa tekrarlar, parmaklarımın doğru konumda kalmasına yardımcı oluyordu. Her gün aynı sayıda kelime yazmak yerine çalışma niteliğine dikkat ettim. Hatalarımı açık biçimde görmek, bir sonraki denemede neyi değiştirmem gerektiğini anlamamı sağladı. Öğrenmenin tek bir sonuçla bitmediğini, düzenli tekrarlarla sürdüğünü gözlemledim."],
 ["Yüzüncü adım", "Bu son alıştırmaya ilk dersteki kısa harf çiftlerini hatırlayarak başladım. Başlangıçta ayrı ayrı düşündüğüm hareketler artık daha tanıdık geliyordu. Heceler, kelimeler, sayılar ve noktalama işaretleri uzun bir metinde bir araya gelmişti. Metni yazarken hızımı zorlamak yerine doğruluğumu korumaya çalıştım. Son satıra ulaştığımda yolculuğun yalnızca bu derslerden ibaret olmadığını biliyordum. Bundan sonra da farklı metinlerle çalışarak öğrendiğim tekniği canlı tutacaktım."]
];
function drill(keys: string, level: number) {
 const letters = [...new Set(keys)];
 const groups = letters.map(key => key.repeat(2));
 const pairs = letters.map((key, index) => key + letters[(index + 1) % letters.length]);
 const sequence = letters.join("");
 return [...groups, ...pairs, sequence, [...letters].reverse().join(""), ...pairs.map(pair => pair.repeat(2)), ...(level > 8 ? groups : [])].join(" ");
}
export function buildSeedLessons(layout: LessonLayout = "TR") {
 return Array.from({ length: 100 }, (_, index) => {
  const levelNumber = index + 1, section = Math.floor(index / 20) + 1;
  const keys = (layout === "F" ? fKeys : qKeys)[index] || "";
  const entry = index < 20 ? [(index === 19 ? "Tüm harfler · genel tekrar" : index === 14 ? "Üst sıra · tuş taraması" : index === 7 ? "Temel sıra · tam tekrar" : index === 5 ? "Temel sıra · ilk tekrar" : keys.toLocaleUpperCase("tr-TR").split("").join(" · ") + " tuşları"), drill(keys, levelNumber)] : index < 40 ? wordLessons[index - 20] : index < 60 ? symbolLessons[index - 40] : passages[index - 60];
  const focusKeys = index < 20 ? [...new Set(keys)].join("") : "";
  const instruction = index === 0 ? layout === "F" ? "Sol işaret parmağını A, sağ işaret parmağını K tuşuna yerleştir. Boşluk için başparmağını kullan." : "Sol işaret parmağını F, sağ işaret parmağını J tuşuna yerleştir. Tuşlardaki çıkıntıları hisset; boşluk için başparmağını kullan." : index < 20 ? "Yalnızca vurgulanan tuşları çalış. Her vuruştan sonra parmaklarını temel sıraya döndür; klavyeye bakmadan yavaşça yaz." : index < 40 ? "Heceleri ve kelimeleri doğru sırayla yaz. Boşlukları atlama; önce doğruluğunu, sonra akıcılığını geliştir." : index < 60 ? "Büyük harf, boşluk ve noktalama işaretlerini aynen koru. Gerektiğinde Shift tuşunu kullan ve hata işaretlerini kontrol et." : "Önce cümleyi gözden geçir. Uzun metin boyunca sakin bir ritim tuttur; yanlış vuruşları Backspace ile düzeltebilirsin.";
  return { levelNumber, slug: "asama-" + String(levelNumber).padStart(3, "0"), title: "Aşama " + levelNumber + ": " + entry[0], description: SECTION_NAMES[section - 1] + ". " + instruction, content: entry[1], section, difficulty: section <= 2 ? "BEGINNER" as const : section === 3 ? "INTERMEDIATE" as const : section === 5 ? "EXAM" as const : "ADVANCED" as const, isPremium: levelNumber > 20, passAccuracy: 95, minWpm: section <= 2 ? 0 : section === 3 ? 10 : section === 4 ? 15 : 20, isPublished: true, focusKeys, instruction, keyboardLayout: layout };
 });
}
export function getCurriculumLesson(slug: string, layout: LessonLayout = "TR") { return buildSeedLessons(layout).find(lesson => lesson.slug === slug); }
export function applyCurriculum<T extends { slug: string; levelNumber: number }>(lesson: T, layout: LessonLayout = "TR") {
 const updated = getCurriculumLesson(lesson.slug, layout);
 if (!updated || updated.levelNumber !== lesson.levelNumber) return lesson;
 // Keep database identity, publication and access flags; replace the built-in lesson's learning content.
 const { title, description, content, section, difficulty, passAccuracy, minWpm, focusKeys, instruction, keyboardLayout } = updated;
 return { ...lesson, title, description, content, section, difficulty, passAccuracy, minWpm, focusKeys, instruction, keyboardLayout };
}
