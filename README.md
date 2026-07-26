# FitPath — Fitness Studio QR Pilot

Mobil öncelikli React/TypeScript prototipi. Üyeyi Almanca onboarding sorularından
trainer onaylı bir başlangıç planına, sıralı makine rotasına ve QR tabanlı set
kaydına götürür. Trainer cockpit aynı planı inceleyip düzenleyebilir ve
yayınlayabilir.

## Çalıştırma

```bash
npm install
npm run dev
```

- Demo davet kodu: `FIT2026`
- Üye/trainer rol değişimi üstteki prototip araç çubuğundadır.
- Tüm demo verileri yalnız tarayıcının `localStorage` alanında tutulur.

## Doğrulama

```bash
npm test
npm run build
```

Test paketi 11.520 onboarding kombinasyonunu, güvenlik kapısını, aktif envanter
filtrelemesini, onaylı makine alternatiflerini, QR çözümlemeyi ve ilerleme
kurallarını kapsar.

Beş üyelik kullanılabilirlik testi ve trainer süre ölçümü için
[`PILOT-TEST.md`](./PILOT-TEST.md) kullanılabilir.

## Pilot sınırları

- Serbest AI ile antrenman veya sağlık yorumu üretilmez.
- Sağlık teşhisi ya da tıbbi ayrıntı saklanmaz; yalnız trainer kontrolü işareti
  tutulur.
- İlk antrenmanda başlangıç ağırlığı otomatik tahmin edilmez.
- Gerçek backend, hesap sistemi, canlı stüdyo envanteri ve mağaza dağıtımı bu
  prototipin kapsamında değildir.
