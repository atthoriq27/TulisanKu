# TulisanKu ✍️
**Tools Copy-Paste Tulisan ke Foto Kertas dengan Font Tulisan Tangan Sendiri**

Aplikasi web modern berbasis HTML5 Canvas yang memungkinkan Anda menyalin dan menempel teks apapun ke atas lembaran kertas (buku tulis, binder, folio, dll.) menggunakan **font tulisan tangan Anda sendiri (.ttf / .otf / .woff)** dengan hasil yang 100% natural, organik, dan realistis layaknya tulisan fisik asli.

---

## 🌟 Fitur Utama Lengkap

### 1. Studio Pembuat Font Bawaan (Gambar Huruf Langsung di Web)
- Gambar huruf sendiri (a-z, A-Z, 0-9, simbol) menggunakan mouse, pen stylus, atau layar sentuh HP/tablet.
- **Smart Fallback**: Huruf yang belum digambar otomatis dilengkapi oleh template bawaan.
- Otomatis di-compile menjadi file `.ttf` asli menggunakan `opentype.js`, langsung terpasang di kertas, dan bisa diunduh ke komputer/HP.
- Dilengkapi 4 font preset siap pakai (*Indie Flower*, *Caveat*, *Kalam*, *Marck Script*).

### 2. Tampilan Dokumen Bersambung Vertikal (Word / Google Docs Style)
- Teks panjang yang melebihi 1 lembar otomatis membelah ke Halaman 2, 3, dst. secara berkesinambungan ke bawah.
- Cukup scroll ke bawah untuk membaca seluruh dokumen tugas.
- Dilengkapi bilah navigasi lengket (*sticky pagination bar*) dengan tombol loncat halaman cepat (`[Hal 1]`, `[Hal 2]`, dst).

### 3. Koleksi 12 Kertas Merek Asli Indonesia
- **Sinar Dunia (SIDU)**: SIDU Garis Merah (SD/SMP), Big Boss Boxy B5 (putih bersih tanpa garis merah), Double Folio Bergaris, Buku Kotak Matematika.
- **KIKY Stationery**: KIKY Eksekutif 70gsm, KIKY Loose Leaf Binder Garis, KIKY Binder Kotak-kotak, KIKY Binder Dot Grid.
- **Paperline & Mirage**: Paperline Double Folio Resmi, Buku Tulis Halus Mirage.
- **Kertas Ujian & HVS**: HVS PaperOne Polos 100%, Kertas Buram Cakaran Ujian Sekolah.
- **Upload Kertas Sendiri**: Dukungan upload foto kertas buku sendiri dari galeri/kamera HP.

### 4. Filter Kamera HP & CamScanner (Anti-Curiga Dosen)
- **Preset 1-Klik**:
  - `📱 CamScanner`: Efek *Magic Color* khas aplikasi CamScanner / Adobe Scan ponsel.
  - `📸 Foto Meja HP`: Gradasi pencahayaan ruangan dan bayangan halus siluet ponsel/tangan pemegang kamera.
  - `💡 Lampu Belajar`: Nuansa *warm golden ivory* yang hangat dan alami khas lampu meja belajar malam hari.
  - `☀️ Cahaya Jendela`: Cahaya lembut matahari pagi dari sisi jendela kamar.
  - `📠 Scan Fotokopi B/W`: Konversi monokrom kontras tinggi dengan tekstur serbuk toner fotokopi.
- **Detail Organik**:
  - Bayangan ponsel/meja (0–60%).
  - Noise sensor kamera ISO smartphone (0–50%).
  - Gelombang garis alami (*baseline drift*) agar tulisan tidak lurus kaku seperti mistar komputer.
  - Bekas lipatan tengah kertas (*paper crease*).
  - Watermark opsional *"Scanned with CamScanner"* di pojok kanan bawah.

### 5. Efek Kesalahan Tulis Manusia (Human Error Simulation)
- **Coretan Pulpen (`~kata~`)**: Mencoret kata yang salah dengan dua goresan pulpen miring alami khas manusia saat menyadari ada *typo*.
- **Tip-Ex Kertas (`[tipex:kata]`)**: Menampilkan stiker putih tip-ex kertas (*correction tape*) dengan kata yang benar ditulis di atasnya.
- **Tombol Pintas**: Blok kata di teks, lalu klik `Coret Kata` atau `Tip-Ex Kertas`.

### 6. Ekspor Langsung 1 File PDF Gabungan (`jsPDF`)
- Tombol **`Download PDF (Tugas)`** warna merah untuk menggabungkan seluruh lembar tugas menjadi 1 file PDF utuh siap kumpul ke Google Classroom / SPADA / WA Dosen tanpa perlu web *iLovePDF*.
- Tombol **`Download PNG`** untuk mengunduh per halaman atau semua halaman dalam format gambar resolusi tinggi (200 DPI).

### 7. Bilah Simbol MTK / IPA & Indentasi Paragraf
- Sisip 1-klik untuk simbol rumus: `≤`, `≥`, `≠`, `±`, `√`, `²`, `³`, `°`, `π`, `θ`, `α`, `β`, `Δ`, `∑`, `∫`, `½`, `¼`, `∞`, `≈`.
- Indentasi paragraf otomatis (menjorok masuk 4 spasi di setiap awal paragraf baru).

---

## 🚀 Panduan Deploy (Siap Online dalam 1 Menit)

Aplikasi ini 100% *client-side* (hanya HTML5, CSS, dan JS) tanpa memerlukan database atau server backend, sehingga bisa di-deploy secara gratis ke berbagai platform:

### 1. Deploy ke Netlify (Paling Praktis)
- **Cara Drop (Tanpa Akun GitHub)**:
  1. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
  2. Tarik folder `TulisanKu` langsung ke layar browser.
  3. Web langsung online dengan URL gratis `https://nama-anda.netlify.app`.
- **Cara Git**:
  1. Push folder ini ke repository GitHub Anda.
  2. Import project di Netlify -> Pilih repository -> Klik **Deploy** (konfigurasi sudah otomatis terbaca dari `netlify.toml`).

### 2. Deploy ke Vercel
1. Install Vercel CLI atau buka [vercel.com](https://vercel.com).
2. Import repository GitHub atau jalankan perintah `vercel` di terminal.
3. Langsung aktif dalam beberapa detik.

### 3. Deploy ke GitHub Pages
1. Buat repository di GitHub, lalu push file proyek ini ke branch `main`.
2. Buka repository -> **Settings** -> **Pages**.
3. Pada bagian *Build and deployment*, pilih Source: **Deploy from a branch** -> Branch: `main` / `root` -> **Save**.

---

## 💻 Menjalankan Secara Lokal di Komputer
```bash
# Menggunakan Python
python -m http.server 8000

# Atau buka index.html langsung dengan extension VS Code "Live Server"
```
Akses di browser melalui `http://localhost:8000`.
