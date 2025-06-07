import prisma from '@/lib/prisma';
import { saveSettings } from '@/lib/settings';
import { exec } from 'child_process';
import bcrypt from 'bcrypt';

export async function POST(req) {
  const defaultSettings = {
    logo: '',
    favicon: '',
    tabTitle: '',
    footerCompany: '',
    github: '',
    xbox: '',
    instagram: '',
    discord: '',
    ip: '',
    carouselImages: ['slide1.png', 'slide2.png', 'slide3.png'],
    aboutContent: `Merhaba ve [Sunucu Adı]'na hoş geldiniz!

Minecraft dünyasında sıradanlıktan sıkıldıysanız, doğru yerdesiniz. Biz, oyuncuların yalnızca bir sunucuya değil; bir topluluğa, bir hikâyeye, bir deneyime katılmasını isteyen tutkulu bir ekibiz. Bu projeye başlarken amacımız, herkesin kendine ait bir yer bulabileceği, özgürce inşa edebileceği, dostluklar kurabileceği ve kalıcı hatıralar biriktirebileceği bir ortam yaratmaktı.

Kimiz?
Bizler, Minecraft’ı sadece bir oyun değil, yaratıcılığın ve topluluğun gücüyle birleşen dijital bir evren olarak gören geliştiriciler, moderatörler ve oyuncularız. Sunucumuzun temelleri, dürüstlük, adalet ve eğlence üzerine kurulmuştur. Her bir detayda, oyuncuların beklentilerini aşacak bir deneyim sunmayı hedefliyoruz.

Neden Biz?
Sıfırdan inşa edilen özel sistemler
Plugin'lerimizin çoğu özel olarak yazıldı. Oyuncu deneyimini maksimuma çıkarmak için klasik sistemleri geliştirerek, benzersiz içerikler sunduk.

Güçlü ekonomi ve adil rekabet
Piyasa sisteminden PvP dengelemesine kadar her şey titizlikle ayarlandı. Her oyuncunun emeği değerli, her başarı gerçek.

Etkin topluluk ve aktif yönetim
Her mesajınız okunur, her öneriniz değerlendirilir. Oyuncularla sürekli iletişimde kalan, şeffaf ve çözüm odaklı bir yönetim anlayışımız var.

Sınır tanımayan özgürlük
Klanlar, savaşlar, ticaret, mimari yapılar ve daha fazlası... Hayal gücünüzle sınırları zorlayabileceğiniz bir dünyadayız.

Gelecek Vizyonumuz
[Sunucu Adı], sadece bugün için değil, gelecek için kuruldu. Yeni oyun modları, zenginleştirilmiş içerikler, oyuncuların yön vereceği etkinlikler ve daha fazlası yolda. Her gün gelişiyor, her öneriyle daha da büyüyoruz.

Bize Katıl
Sen de bu topluluğun bir parçası olmak istiyorsan, bekleme.
Bir kazmayı al, ilk taşını koy ve kendi hikâyeni yazmaya başla.

[Sunucu IP’si]
[Discord Linki]
[Destek ve İletişim]

Birlikte inşa edelim.
Birlikte oynayalım.
Birlikte büyüyelim.`,
    backgroundColor: 'rgba(38,42,102,0.7)',
    backgroundImage: 'bg.jpg'
  }; 
  await prisma.userBadge.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  await saveSettings(defaultSettings);

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  await fetch(`${baseUrl}/api/settings/bgcss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backgroundImage: defaultSettings.backgroundImage, backgroundColor: defaultSettings.backgroundColor })
  });

  await new Promise((resolve, reject) => {
    exec('npx prisma migrate reset --force --skip-seed', { shell: 'powershell.exe' }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout || error);
      } else {
        resolve(stdout);
      }
    });
  });

  const hashedPassword = await bcrypt.hash('admin', 12);
  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
    }
  });

  await prisma.badge.create({
    data: {
      description: 'Yeni Başlayan',
      icon: 'star',
      bgColor: '#ff8800',
    },
  });
  
  await prisma.galleryImage.create({
    data: {
      imageUrl: '/slide1.png',
      caption: 'Açıklama'
    }
  });

  return Response.json({ ok: true });
}
