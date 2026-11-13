# TK Helpdesk Web

TK Helpdesk'in React ve TypeScript ile geliştirdiğim web arayüzü. Helpdesk kullanıcıları buradan destek taleplerini oluşturabiliyor, şirket ve kullanıcı bilgilerini yönetebiliyor. Çalışanlar ise kendi departmanlarına gelen talepleri sahiplenip süreçlerini takip edebiliyor.

Anadizindeki docs klasörü altında ekran görüntülerini inceleyebilirsiniz.

Vite, React Query, Axios ve Socket.IO Client kullanılıyor.

Diğer projeler: [API](https://github.com/TugberkKocoglu/TkHelpdeskApi) · [Mobile](https://github.com/TugberkKocoglu/TkHelpdeskMobile)

## Kurulum

Windows 11'de Node.js 24.14.0 ile test ettim. Web uygulamasını açmadan önce [API projesindeki](https://github.com/TugberkKocoglu/TkHelpdeskApi) kurulumun tamamlanmış, PostgreSQL'in ve API'nin çalışıyor olması gerekiyor.

```powershell
git clone https://github.com/TugberkKocoglu/TkHelpdeskWeb.git
cd TkHelpdeskWeb
npm ci
npm run dev
```

Arayüz varsayılan olarak şu adreste açılıyor:

http://localhost:5173

API ise `http://localhost:5218` adresinde çalışıyor. Giriş için API kurulumunda seed ile oluşturulan Helpdesk hesabını kullanabilirsiniz.

> API tarafındaki CORS ayarı `http://localhost:5173` adresine göre yapıldı. Vite başka bir port açarsa önce 5173'ün başka bir işlem tarafından kullanılıp kullanılmadığına bakın.

## Deneme akışı

1. Helpdesk hesabıyla giriş yapın.
2. Kullanıcılar ekranından Yazılım veya Yazılım Destek departmanına bir Employee kullanıcısı ekleyin.
3. Firma ve departman seçerek yeni bir talep oluşturun.
4. Employee hesabıyla giriş yapıp departman havuzundaki talebi sahiplenin, başlatın ve çözüm notuyla kapatın.
5. Web ve mobil uygulama birlikte açıksa talep durumlarının Socket.IO üzerinden güncellenmesini kontrol edebilirsiniz.

Dashboard, raporlar ve uygulama içi bildirimler de web tarafında bulunuyor.

## Diğer komutlar

```powershell
npm run build
npm run lint
```

## Kurulum notları

| Durum                       | Kontrol edilecek yer                                                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Girişte `Network Error`     | API'nin çalıştığını `http://localhost:5218/api/health` üzerinden kontrol edin.                                                                                         |
| CORS uyarısı                | Web'in `http://localhost:5173` üzerinden açıldığını kontrol edin.                                                                                                      |
| Hesapla giriş yapılamıyor   | API seed işleminde belirlenen kullanıcı bilgilerini kullanın.                                                                                                          |
| `npm ci` güvenlik uyarıları | Windows denemesinde 10 orta seviye npm audit bulgusu vardı. Detayları `npm audit` ile görebilirsiniz; paketleri güncellemeden önce uyumluluğu kontrol etmek gerekiyor. |
| Veri anlık güncellenmiyor   | API terminalindeki Socket.IO bağlantısını ve tarayıcı konsolunu kontrol edin.                                                                                          |

Web projesi tek başına çalışabilir, ancak giriş ve veri işlemleri için API'ye ihtiyaç duyuyor.
