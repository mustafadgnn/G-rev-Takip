# TaskMaster Dashboard Projesi

Bu proje, kullanıcıların görevlerini yönetebileceği bir **Task Management ** uygulamasıdır.

## Proje Açıklaması

Bu proje, **TaskMaster** isimli bir görev yönetim sistemi uygulamasıdır. Uygulama, kullanıcıların görevlerini oluşturabileceği, güncelleyebileceği ve silebileceği bir yönetim paneli sunar. Kullanıcılar, görevleri belirli kişilere atayabilir ve görevlerin durumunu yönetebilir. 
Ayrıca, **Metronic** template ile entegre edilerek modern ve kullanıcı dostu bir arayüz sağlanmıştır.

## Özellikler

- Kullanıcılar için giriş/çıkış ekranları.
- Görev oluşturma, güncelleme ve silme fonksiyonları.
- Görevlerin belirli kişilere atanması ve durum yönetimi (tamamlanmış/tamamlanmamış).
- **Metronic** template ile şık ve modern kullanıcı arayüzü.
- Dinamik olarak kullanıcı ve görev listeleri.

- ## Kullanılan Teknolojiler

- **Node.js**: Backend geliştirme.
- **TypeScript**: Backend API'sinin geliştirilmesi.
- **Express.js**: REST API servisi.
- **PostgreSQL**: Veritabanı yönetimi.
- **Bootstrap**: Arayüz geliştirme.
- **Metronic Template**: Modern kullanıcı arayüzü tasarımı.
- **JSON Web Token (JWT)**: Kullanıcı oturumları için güvenli kimlik doğrulama.

## Kurulum

1. Bu repoyu klonlayın:
    ```bash
    git clone https://github.com/kullanici_adi/taskmaster-dashboard.git
    ```
2. Gerekli bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3. Veritabanı bağlantı ayarlarını `.env` dosyasında düzenleyin (örnek dosya: `.env.example`).
4. TypeScript dosyalarını derleyin:
    ```bash
    npx tsc
    ```
5. Projeyi başlatın:
    ```
    npx ts-node server.ts
    ```

Projeyi localde çalıştırdıktan sonra [http://localhost:3000](http://localhost:3000) adresinden erişebilirsiniz.

