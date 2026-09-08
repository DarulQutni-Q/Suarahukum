# SuaraHukum

SuaraHukum adalah aplikasi web civic tech yang dirancang untuk membantu masyarakat Indonesia memahami dokumen hukum dan kontrak perjanjian sehari-hari. Banyak orang menandatangani perjanjian kerja (PKWT), surat sewa menyewa, kontrak pinjaman, atau kesepakatan bisnis tanpa benar-benar memahami klausul di dalamnya karena bahasa hukum sengaja disusun berbelit-belit.

Aplikasi ini memungkinkan pengguna mengambil foto dokumen melalui kamera ponsel atau mengunggah berkas gambar, memotong bagian penting, lalu menganalisisnya secara otomatis menggunakan model kecerdasan buatan Gemini. Hasil analisis disajikan dalam bahasa Indonesia sederhana yang membedah hak Anda, klausul berisiko, bagian yang menguntungkan, serta rekomendasi tindakan praktis sebelum Anda membubuhkan tanda tangan.

Proyek ini dapat diuji coba di: https://suarahukum.vercel.app

---

## Fitur Utama

- Pemindaian Kamera dan Pangkas Gambar: Ambil foto langsung dari ponsel dengan kendali kamera depan/belakang dan lampu senter, lengkap dengan alat pemotong area dokumen.
- Analisis Berbasis Hukum Positif Indonesia: Model menganalisis dokumen dengan membandingkan klausul terhadap acuan hukum nasional seperti KUHPerdata Buku III, UU Ketenagakerjaan No. 13/2003, UU Cipta Kerja No. 6/2023, dan peraturan terkait lainnya.
- Pembedahan Terstruktur: Menghasilkan ringkasan dokumen, daftar hak hukum Anda, klausul berbahaya beserta tingkat risikonya, klausul yang aman, dan rekomendasi langkah berikutnya.
- Tanya Jawab Lanjutan: Fitur interaktif untuk mengajukan pertanyaan spesifik terkait dokumen yang baru saja dianalisis dengan batas respons yang padat dan jelas.
- Riwayat Analisis Offline: Riwayat tersimpan di penyimpanan lokal peramban dengan thumbnail terkompresi hemat memori untuk mencegah batas kuota penyimpanan browser.
- Ekspor Dokumen PDF: Unduh salinan laporan analisis dokumen ke dalam format PDF untuk disimpan atau dibagikan.
- Autentikasi Pengguna: Masuk dengan Google atau pendaftaran akun email yang terverifikasi via Firebase Authentication.

---

## Arsitektur Teknologi

### Frontend
- React 19 (React DOM)
- Vite 6 untuk bundler dan development server
- TypeScript untuk type safety menyeluruh
- Tailwind CSS v4 untuk sistem utilitas antarmuka
- Radix UI dan Shadcn UI untuk komponen primitif aksesibel (Dialog, Accordion, Tooltip, dsb.)
- Framer Motion untuk transisi dan interaksi mikro
- HTML-to-Image dan jsPDF untuk pembuatan berkas laporan PDF

### Backend dan AI
- Google GenAI SDK (@google/genai) menggunakan model Gemini 2.5 Flash
- Express untuk server lokal dan penyajian berkas statis
- Vercel Serverless Functions di direktori api/ untuk deployment produksi tanpa server
- Firebase Authentication dan Cloud Firestore untuk profil pengguna dan aturan akses

---

## Struktur Direktori

```text
SuaraHukum/
├── api/                       # Vercel Serverless API handlers
│   ├── analyze.ts             # Endpoint analisis dokumen berbasis Gemini
│   └── chat.ts                # Endpoint tanya jawab interaktif
├── public/                    # Aset statis dan favicon
├── src/
│   ├── components/            # Komponen modular
│   │   ├── auth/              # Modal login, registrasi, dan menu profil
│   │   ├── home/              # Bagian-bagian beranda (Navbar, Hero, FAQ, dll.)
│   │   └── ui/                # Komponen antarmuka dasar Shadcn/Radix
│   ├── lib/                   # Utility fungsi pembantu (cn, class merge)
│   ├── screens/               # Layar aplikasi utama (Home, Scanner, Result, dll.)
│   ├── utils/                 # Logika penyimpanan, integrasi AI, dan data profil
│   ├── App.tsx                # Komponen root dengan code-splitting (React.lazy)
│   ├── firebase.ts            # Inisialisasi Firebase App, Auth, dan Firestore
│   ├── main.tsx               # Titik masuk aplikasi React
│   ├── reducer.ts             # Pengelola state aplikasi (pure reducer)
│   └── types.ts               # Definisi tipe TypeScript
├── server.ts                  # Server Express lokal
├── tsconfig.json              # Konfigurasi TypeScript dan path alias (@/* -> ./src/*)
├── vite.config.ts             # Konfigurasi Vite plugin React & Tailwind
└── package.json               # Dependensi dan skrip proyek
```

---

## Panduan Menjalankan Secara Lokal

### Prasyarat
- Node.js versi 20 atau lebih baru
- npm (versi 10 ke atas)
- Kunci API Google Gemini (dapat diperoleh melalui Google AI Studio)

### Langkah Instalasi

1. Salin repositori ini ke komputer lokal Anda:
   ```bash
   git clone https://github.com/DarulQutni-Q/SuaraHukum.git
   cd SuaraHukum
   ```

2. Pasang semua dependensi proyek:
   ```bash
   npm install
   ```

3. Siapkan berkas konfigurasi lingkungan:
   Salin berkas `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

   Buka berkas `.env` dan isi nilai yang diperlukan:
   ```env
   # Kunci API dari Google AI Studio
   GEMINI_API_KEY="kunci_gemini_anda"

   # URL lokal aplikasi
   APP_URL="http://localhost:3000"

   # Daftar email admin untuk akses pengujian (dipisahkan koma)
   VITE_ADMIN_EMAILS="email_anda@domain.com"
   ```

4. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

   Aplikasi akan berjalan di http://localhost:3000.

---

## Skrip yang Tersedia

- `npm run dev`: Menjalankan server pengembangan terpadu (Express + Vite HMR).
- `npm run build`: Membangun bundle produksi teroptimasi dan bundel server ke folder `dist/`.
- `npm run start`: Menjalankan server produksi dari hasil build `dist/`.
- `npm run lint`: Memeriksa konsistensi tipe TypeScript (`tsc --noEmit`).
- `npm run preview`: Meninjau build client menggunakan server preview bawaan Vite.

---

## Batasan dan Penafian Hukum

SuaraHukum adalah alat bantu edukatif berbasis model kecerdasan buatan dan bukan merupakan kantor hukum, advokat berizin, atau pengganti nasihat hukum resmi. Analisis yang dihasilkan ditujukan semata-mata untuk meningkatkan literasi dan pemahaman awal atas teks perjanjian. Untuk keputusan penting yang memiliki dampak finansial atau hukum yang signifikan, selalu konsultasikan dokumen Anda dengan advokat atau penasihat hukum profesional yang memiliki izin resmi.

---

## Lisensi

Proyek ini dirilis di bawah lisensi Apache License 2.0. Lihat berkas [LICENSE](LICENSE) untuk ketentuan hukum dan distribusi selengkapnya.
