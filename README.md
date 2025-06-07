# Minecraft Sunucusu Web Sitesi

Bu proje, özel bir Minecraft sunucusu için hazırlanmış modern bir Next.js tabanlı web sitesidir.

## Özellikler
- Sunucu tanıtımı ve topluluk hakkında bilgi
- Oyuncu profilleri ve yönetim paneli
- Galeri, destek, kullanıcı yönetimi ve daha fazlası
- Modern ve mobil uyumlu arayüz

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

Bu adımlardan sonra derleme oluşacaktır, derlemenize .env dosyasındaki BASE_URL üzerinden ulaşabilirsiniz.
Sunucuyu bir kere derledikten sonra, tekrar derlemenize gerek yoktur. Kapatmak için CTRL + C tuşlarına aynı anda basmanız yeterlidir.
Sunucunuzu tekrar açmak istediğiniz takdirde:

Sunucuyu başlatın:
   
   ```powershell
   npm start
   ```


## Temiz Build (Production için)

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
