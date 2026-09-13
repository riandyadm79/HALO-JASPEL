# HALO JASPEL

Sistem manajemen alokasi jasa pelayanan rumah sakit dan BLUD.

## Menjalankan lokal

```bash
npm install
npm run dev
```

## Build single-file

Build produksi menghasilkan `dist/index.html` dengan JavaScript dan CSS
di-inline, sehingga tidak membutuhkan folder asset tambahan.

```bash
npm run build:single
```

## Deploy ke GitHub Pages

Workflow [deploy.yml](.github/workflows/deploy.yml) otomatis menjalankan build
dan deploy setiap push ke branch `main`. Di repository GitHub, buka
**Settings > Pages**, pilih **GitHub Actions** sebagai source, lalu push
proyek ini ke branch `main`.
