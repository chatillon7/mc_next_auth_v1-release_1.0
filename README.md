# Minecraft Sunucusu Web Sitesi

Bu proje, özel bir Minecraft sunucusu için hazırlanmış modern bir Next.js tabanlı web sitesidir.

## Özellikler
- Sunucu tanıtımı ve topluluk hakkında bilgi
- Oyuncu profilleri ve yönetim paneli
- Galeri, destek, kullanıcı yönetimi ve daha fazlası
- Modern ve mobil uyumlu arayüz

## Gereksinimler

   ```
   Node.js
   npm
   ```

## Derleme ve Çalıştırma

Derleme ve çalıştırmak için aşağıdaki adımları izleyin:

1. .env Dosyasını kişiselleştirin:

   ```
    DATABASE_URL="file:./db.sqlite"
    SESSION_SECRET="super-secret-key-change-this"
    BASE_URL="http://localhost:3000"
   ```

2. Gerekli bağımlılıkları yükleyin:
   
   ```powershell
   npm install
   ```

3. Build komutunu çalıştırın:
   
   ```powershell
   npm run build
   ```

4. Sunucuyu başlatın:
   
   ```powershell
   npm start
   ```

5. ADMIN hesap bilgileri:
   
   ```
   Kullanıcı Adı: admin
   E-Posta Adresi: admin@admin.com
   Parola: admin
   ```

Bu adımlardan sonra derleme oluşacaktır, derlemenize .env dosyasındaki BASE_URL üzerinden ulaşabilirsiniz.
Sunucuyu bir kere derledikten sonra, tekrar derlemenize gerek yoktur. Kapatmak için CTRL + C tuşlarına aynı anda basmanız yeterlidir.
Sunucunuzu tekrar açmak istediğiniz takdirde:

Sunucuyu başlatın:
   
   ```powershell
   npm start
   ```


## Temiz Build (Derleme yayımladıktan sonra tekrar sıfır bir kurulum için)

Temiz bir production build için aşağıdaki adımları izleyin:

1. Önceki build dosyalarını temizleyin:
   
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

2. (Opsiyonel) node_modules ve cache temizliği:
   
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force package-lock.json
   npm cache clean --force
   npm install
   ```

3. Build komutunu çalıştırın:
   
   ```powershell
   npm run build
   ```

4. Sunucuyu başlatın:
   
   ```powershell
   npm start
   ```

Bu adımlar, eski build kalıntılarını ve önbellekleri temizleyerek tamamen temiz bir production build oluşturur.

## Yapılandırma
- Ayarlar ve içerik `db/settings.json` dosyasından yönetilir.
- Ortam değişkenleri `.env` dosyası ile ayarlanabilir (örn. SESSION_SECRET).

## Katkı ve Lisans
Bu proje özelleştirilmiş olup, topluluk katkılarına açıktır. Lisans ve detaylar için proje sahibine ulaşabilirsiniz.

## Proje Raporu
[Görüntülemek için tıklayınız](https://github.com/chatillon7/mc_next_auth_v1-release_1.0/blob/main/proje_raporu.pdf)
