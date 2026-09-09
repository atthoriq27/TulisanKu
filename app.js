/**
 * TulisanKu - Core Canvas Rendering Engine & Web Controller
 */

// Standar Ukuran Kertas Fisik (200 DPI Resolusi Cetak/Unduh)
const PAPER_SIZES = {
  a4: { width: 1654, height: 2338, label: '1654 × 2338 px' },
  f4: { width: 1654, height: 2550, label: '1654 × 2550 px' },
  b5: { width: 1417, height: 2008, label: '1417 × 2008 px' }
};

// Aliases mapping for legacy/saved presets to Indonesian stationery presets
const PRESET_ALIASES = {
  'notebook-lined': 'sidu-lined',
  'folio-double': 'sidu-folio',
  'campus-lined': 'sidu-bigboss',
  'binder-grid': 'kiky-binder-grid',
  'binder-dotted': 'kiky-binder-dot',
  'math-grid': 'sidu-kotak',
  'legal-pad': 'kiky-executive',
  'kraft-buram': 'buram-cakaran',
  'vintage-blank': 'kiky-binder-line',
  'hvs-clean': 'paperone-hvs'
};

// --- Application State ---
const state = {
  font: {
    family: 'Indie Flower',
    isCustom: false,
    customFontName: null,
  },
  paper: {
    type: 'preset', // 'preset' | 'custom'
    presetName: 'sidu-lined',
    sizeName: 'a4',
    customImage: null,
    width: 1654,  // Standard A4 aspect (~200 DPI)
    height: 2338,
  },
  text: {
    raw: '',
    autoIndent: false,
    header: {
      name: '',
      studentClass: '',
      date: '',
      subject: '',
    }
  },
  tuning: {
    fontSize: 26,
    lineHeight: 46,
    marginTop: 145,
    marginLeft: 130,
    marginRight: 80,
    marginBottom: 100,
    letterSpacing: 0,
    slant: 0,
    headerMarginTop: 95,
    headerMarginLeft: 130,
    headerLineHeight: 40,
    headerFontSize: 24,
  },
  realism: {
    inkColor: '#1e293b',
    inkOpacity: 0.94,
    jitter: 2.0,
    blendMultiply: true,
  },
  cameraFilter: {
    preset: 'none', // 'none' | 'camscanner' | 'desk_photo' | 'warm_lamp' | 'scanner_bw' | 'daylight'
    shadowIntensity: 25,
    noiseIntensity: 15,
    paperFold: false,
    baselineDrift: 0.8,
    camScannerWatermark: false
  },
  view: {
    showGuides: false,
    zoom: 1.0,
    currentPage: 1,
    totalPages: 1,
  },
  paginatedPages: [] // Array of array of lines per page
};

// Preset Paper Cache
const paperCanvasCache = {};

// DOM Elements
const canvas = document.getElementById('renderCanvas');
const ctx = canvas.getContext('2d');
const canvasViewport = document.getElementById('canvasViewport');

// Form & Controls
const fontFileInput = document.getElementById('fontFileInput');
const fontStatusBadge = document.getElementById('fontStatusBadge');
const fontPresetContainer = document.getElementById('fontPresetContainer');
const fontStorageInfo = document.getElementById('fontStorageInfo');
const savedFontLabel = document.getElementById('savedFontLabel');
const removeSavedFontBtn = document.getElementById('removeSavedFontBtn');

const paperFileInput = document.getElementById('paperFileInput');
const paperPresetContainer = document.getElementById('paperPresetContainer');
const paperStatusBadge = document.getElementById('paperStatusBadge');
const paperStorageInfo = document.getElementById('paperStorageInfo');
const savedPaperLabel = document.getElementById('savedPaperLabel');
const removeSavedPaperBtn = document.getElementById('removeSavedPaperBtn');

const mainTextInput = document.getElementById('mainTextInput');
const charCountLabel = document.getElementById('charCountLabel');
const clearTextBtn = document.getElementById('clearTextBtn');

const clearHeaderBtn = document.getElementById('clearHeaderBtn');
const headerFieldsSection = document.getElementById('headerFieldsSection');
const headerNameInput = document.getElementById('headerNameInput');
const headerClassInput = document.getElementById('headerClassInput');
const headerDateInput = document.getElementById('headerDateInput');
const headerSubjectInput = document.getElementById('headerSubjectInput');

// Header Sliders & Values (Terpisah)
const headerMarginTopSlider = document.getElementById('headerMarginTopSlider');
const headerMarginTopVal = document.getElementById('headerMarginTopVal');
const headerMarginLeftSlider = document.getElementById('headerMarginLeftSlider');
const headerMarginLeftVal = document.getElementById('headerMarginLeftVal');
const headerLineHeightSlider = document.getElementById('headerLineHeightSlider');
const headerLineHeightVal = document.getElementById('headerLineHeightVal');
const headerFontSizeSlider = document.getElementById('headerFontSizeSlider');
const headerFontSizeVal = document.getElementById('headerFontSizeVal');

// Body Text Sliders & Values
const lineHeightSlider = document.getElementById('lineHeightSlider');
const lineHeightVal = document.getElementById('lineHeightVal');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeVal = document.getElementById('fontSizeVal');
const marginTopSlider = document.getElementById('marginTopSlider');
const marginTopVal = document.getElementById('marginTopVal');
const marginLeftSlider = document.getElementById('marginLeftSlider');
const marginLeftVal = document.getElementById('marginLeftVal');
const marginRightSlider = document.getElementById('marginRightSlider');
const marginRightVal = document.getElementById('marginRightVal');
const letterSpacingSlider = document.getElementById('letterSpacingSlider');
const letterSpacingVal = document.getElementById('letterSpacingVal');
const slantSlider = document.getElementById('slantSlider');
const slantVal = document.getElementById('slantVal');
const resetCalibrationBtn = document.getElementById('resetCalibrationBtn');

// Realism Controls
const inkColorContainer = document.getElementById('inkColorContainer');
const customColorPicker = document.getElementById('customColorPicker');
const jitterSlider = document.getElementById('jitterSlider');
const jitterVal = document.getElementById('jitterVal');
const inkOpacitySlider = document.getElementById('inkOpacitySlider');
const inkOpacityVal = document.getElementById('inkOpacityVal');
const blendModeToggle = document.getElementById('blendModeToggle');

// Camera Filter & Scanner Controls (Anti-Curiga Dosen)
const cameraFilterPresets = document.getElementById('cameraFilterPresets');
const filterShadowSlider = document.getElementById('filterShadowSlider');
const filterShadowVal = document.getElementById('filterShadowVal');
const filterNoiseSlider = document.getElementById('filterNoiseSlider');
const filterNoiseVal = document.getElementById('filterNoiseVal');
const filterWaveSlider = document.getElementById('filterWaveSlider');
const filterWaveVal = document.getElementById('filterWaveVal');
const filterFoldToggle = document.getElementById('filterFoldToggle');
const camScannerWatermarkToggle = document.getElementById('camScannerWatermarkToggle');

// Human Error & Text Formatting Controls
const strikeoutTextBtn = document.getElementById('strikeoutTextBtn');
const tipexTextBtn = document.getElementById('tipexTextBtn');
const autoIndentToggle = document.getElementById('autoIndentToggle');

// Guides, Zoom & Pagination
const toggleGuidesBtn = document.getElementById('toggleGuidesBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomFitBtn = document.getElementById('zoomFitBtn');
const zoomReset100Btn = document.getElementById('zoomReset100Btn');
const zoomLevelText = document.getElementById('zoomLevelText');
const zoomLevel = document.getElementById('zoomLevel');
const previewPanel = document.getElementById('previewPanel');
const paperSizeContainer = document.getElementById('paperSizeContainer');
const paperDimensionBadge = document.getElementById('paperDimensionBadge');

const paginationBar = document.getElementById('paginationBar');
const documentPagesContainer = document.getElementById('documentPagesContainer');
const pageJumpContainer = document.getElementById('pageJumpContainer');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');
const downloadPageBtn = document.getElementById('downloadPageBtn');
const downloadAllPagesBtn = document.getElementById('downloadAllPagesBtn');
const downloadPdfNavBtn = document.getElementById('downloadPdfNavBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// --- IndexedDB Local Storage Helper (Tanpa Database Server) ---
const DB_NAME = 'TulisanKu_DB';
const DB_VERSION = 1;
const STORE_NAME = 'user_assets';

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveAssetToDB(id, data) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, ...data });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan ke IndexedDB:', err);
  }
}

async function getAssetFromDB(id) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Gagal membaca dari IndexedDB:', err);
    return null;
  }
}

async function deleteAssetFromDB(id) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Gagal menghapus dari IndexedDB:', err);
  }
}

// Restore saved font & paper from browser local IndexedDB on page load
async function restoreAssetsFromDB() {
  // 1. Check saved custom font
  try {
    const savedFont = await getAssetFromDB('custom_font');
    if (savedFont && savedFont.buffer) {
      let isOldDotFont = false;
      if (window.opentype) {
        try {
          const parsed = opentype.parse(savedFont.buffer.slice(0));
          const glyphs = Object.values(parsed.glyphs.glyphs || {});
          const userDrawn = glyphs.filter(g => g.unicode && g.unicode > 32 && g.path && g.path.commands && g.path.commands.length > 0);
          if (userDrawn.length > 0 && userDrawn.every(g => g.path.commands.length === 9 || (g.path.commands.length % 9 === 0 && g.path.commands.length <= 27))) {
            isOldDotFont = true;
          }
        } catch (_) {}
      }

      if (isOldDotFont) {
        await deleteAssetFromDB('custom_font');
      } else {
        const fontFace = new FontFace(savedFont.fontFamily, savedFont.buffer);
        const loaded = await fontFace.load();
        document.fonts.add(loaded);

        state.font.family = savedFont.fontFamily;
        state.font.isCustom = true;
        state.font.customFontName = savedFont.name;

        fontStatusBadge.textContent = 'Font Kustom Aktif';
        fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
        savedFontLabel.textContent = savedFont.name;
        fontStorageInfo.classList.remove('hidden');

        fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(b => b.classList.remove('active'));
      }
    }
  } catch (err) {
    console.warn('Gagal restore custom font:', err);
  }

  // 2. Check saved custom paper
  try {
    const savedPaper = await getAssetFromDB('custom_paper');
    if (savedPaper && savedPaper.dataUrl) {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          state.paper.type = 'custom';
          state.paper.customImage = img;
          state.paper.width = img.naturalWidth;
          state.paper.height = img.naturalHeight;

          paperStatusBadge.textContent = 'Foto Kustom';
          paperStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
          savedPaperLabel.textContent = savedPaper.name;
          paperStorageInfo.classList.remove('hidden');

          paperPresetContainer.querySelectorAll('.paper-preset-btn').forEach(b => b.classList.remove('active'));
          resolve();
        };
        img.src = savedPaper.dataUrl;
      });
    }
  } catch (err) {
    console.warn('Gagal restore custom paper:', err);
  }
}

// --- Initialization ---
async function init() {
  state.text.raw = mainTextInput.value;
  updateTextStats();
  setupEventListeners();
  generatePresetPaper('sidu-lined');
  await restoreAssetsFromDB();
  initFontStudio();
  paginateText();
  render();
  handleResize();
  window.addEventListener('resize', handleResize);
}

// --- Procedural Paper Background Generator (12 Template Kertas Merek Asli Indonesia) ---
function generatePresetPaper(presetName) {
  // Resolve legacy alias if any
  if (PRESET_ALIASES[presetName]) {
    presetName = PRESET_ALIASES[presetName];
  }

  if (paperCanvasCache[presetName]) return paperCanvasCache[presetName];

  const pCanvas = document.createElement('canvas');
  pCanvas.width = state.paper.width;
  pCanvas.height = state.paper.height;
  const pCtx = pCanvas.getContext('2d');

  if (presetName === 'sidu-lined') {
    // 1. Buku Tulis SIDU Standar (SD/SMP) - Kertas krem lembut dengan garis merah di tepi kiri
    pCtx.fillStyle = '#fbf9f4';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.025);

    // Garis horizontal biru muda (46px grid)
    pCtx.strokeStyle = '#c5d5ea';
    pCtx.lineWidth = 1.5;
    for (let y = 145; y < pCanvas.height - 80; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

    // Satu garis merah vertikal pembatas kiri (khas buku tulis sekolah SIDU)
    pCtx.strokeStyle = '#f87171';
    pCtx.lineWidth = 2.0;
    pCtx.beginPath();
    pCtx.moveTo(130, 0);
    pCtx.lineTo(130, pCanvas.height);
    pCtx.stroke();

    // Garis dekoratif cyan tipis di batas atas
    pCtx.strokeStyle = '#93c5fd';
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(0, 100);
    pCtx.lineTo(pCanvas.width, 100);
    pCtx.stroke();

  } else if (presetName === 'sidu-bigboss') {
    // 2. Buku Big Boss SIDU (Boxy B5) - Kertas putih bersih garis abu-abu tipis, TANPA garis merah!
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.015);

    // Garis horizontal abu-abu slate halus (46px grid)
    pCtx.strokeStyle = '#cbd5e1';
    pCtx.lineWidth = 1.2;
    for (let y = 140; y < pCanvas.height - 60; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

    // Header tulisan minimalis NO. dan DATE di kanan atas khas buku Big Boss
    pCtx.fillStyle = '#94a3b8';
    pCtx.font = 'bold 12px sans-serif';
    pCtx.fillText('NO.    : ..............................', pCanvas.width - 240, 58);
    pCtx.fillText('DATE  : ..............................', pCanvas.width - 240, 80);

  } else if (presetName === 'sidu-folio') {
    // 3. Kertas Double Folio SIDU - Putih bersih garis biru muda, TANPA garis merah!
    pCtx.fillStyle = '#fdfdfc';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.015);

    // Garis horizontal ganda di atas (khas double folio Indonesia untuk batas header)
    pCtx.strokeStyle = '#93c5fd';
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(0, 96);
    pCtx.lineTo(pCanvas.width, 96);
    pCtx.stroke();

    pCtx.beginPath();
    pCtx.moveTo(0, 102);
    pCtx.lineTo(pCanvas.width, 102);
    pCtx.stroke();

    // Garis horizontal biru muda lembut (46px grid)
    pCtx.strokeStyle = '#bfdbfe';
    pCtx.lineWidth = 1.3;
    for (let y = 145; y < pCanvas.height - 60; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

  } else if (presetName === 'sidu-kotak') {
    // 4. Buku Kotak SIDU (Matematika / Ram) - Petak 25px biru muda
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.015);

    pCtx.strokeStyle = '#bfdbfe';
    pCtx.lineWidth = 0.9;
    for (let x = 0; x < pCanvas.width; x += 25) {
      pCtx.beginPath();
      pCtx.moveTo(x, 0);
      pCtx.lineTo(x, pCanvas.height);
      pCtx.stroke();
    }
    for (let y = 0; y < pCanvas.height; y += 25) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

  } else if (presetName === 'kiky-executive') {
    // 5. Buku Tulis KIKY Eksekutif - Kertas putih tebal, garis abu-abu rapi dan elegan
    pCtx.fillStyle = '#fcfcfc';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.018);

    pCtx.strokeStyle = '#cbd5e1';
    pCtx.lineWidth = 1.2;
    for (let y = 145; y < pCanvas.height - 60; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

    // Garis atas perak tipis elegan
    pCtx.strokeStyle = '#94a3b8';
    pCtx.lineWidth = 1.8;
    pCtx.beginPath();
    pCtx.moveTo(0, 100);
    pCtx.lineTo(pCanvas.width, 100);
    pCtx.stroke();

  } else if (presetName === 'kiky-binder-line') {
    // 6. KIKY Loose Leaf (Binder Bergaris) - Lubang ring binder di sisi kiri
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.02);

    pCtx.strokeStyle = '#cbd5e1';
    pCtx.lineWidth = 1.2;
    for (let y = 140; y < pCanvas.height - 70; y += 44) {
      pCtx.beginPath();
      pCtx.moveTo(70, y);
      pCtx.lineTo(pCanvas.width - 20, y);
      pCtx.stroke();
    }

    // Lubang ring binder khas loose leaf mahasiswa di sisi kiri
    const holeX = 40;
    const holeRadius = 18;
    const holeYs = [200, 450, 700, 950, 1200, 1450, 1700, 1950, 2200];
    holeYs.forEach(y => {
      pCtx.fillStyle = '#f1f5f9';
      pCtx.beginPath();
      pCtx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.strokeStyle = '#cbd5e1';
      pCtx.lineWidth = 1.5;
      pCtx.stroke();
    });

  } else if (presetName === 'kiky-binder-grid') {
    // 7. KIKY Loose Leaf (Binder Kotak) - Grid 30px + Lubang binder
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.02);

    pCtx.strokeStyle = '#e2e8f0';
    pCtx.lineWidth = 1.0;
    for (let x = 70; x < pCanvas.width - 20; x += 30) {
      pCtx.beginPath();
      pCtx.moveTo(x, 0);
      pCtx.lineTo(x, pCanvas.height);
      pCtx.stroke();
    }
    for (let y = 0; y < pCanvas.height; y += 30) {
      pCtx.beginPath();
      pCtx.moveTo(70, y);
      pCtx.lineTo(pCanvas.width - 20, y);
      pCtx.stroke();
    }

    // Lubang ring binder
    const holeX = 40;
    const holeRadius = 18;
    const holeYs = [200, 450, 700, 950, 1200, 1450, 1700, 1950, 2200];
    holeYs.forEach(y => {
      pCtx.fillStyle = '#f1f5f9';
      pCtx.beginPath();
      pCtx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.strokeStyle = '#cbd5e1';
      pCtx.lineWidth = 1.5;
      pCtx.stroke();
    });

  } else if (presetName === 'kiky-binder-dot') {
    // 8. KIKY Loose Leaf (Binder Dot Titik) - Dot grid 30px + Lubang binder
    pCtx.fillStyle = '#fafaf9';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.02);

    pCtx.fillStyle = '#94a3b8';
    for (let x = 80; x < pCanvas.width - 20; x += 30) {
      for (let y = 30; y < pCanvas.height; y += 30) {
        pCtx.beginPath();
        pCtx.arc(x, y, 1.4, 0, Math.PI * 2);
        pCtx.fill();
      }
    }

    // Lubang ring binder
    const holeX = 40;
    const holeRadius = 18;
    const holeYs = [200, 450, 700, 950, 1200, 1450, 1700, 1950, 2200];
    holeYs.forEach(y => {
      pCtx.fillStyle = '#f1f5f9';
      pCtx.beginPath();
      pCtx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.strokeStyle = '#cbd5e1';
      pCtx.lineWidth = 1.5;
      pCtx.stroke();
    });

  } else if (presetName === 'paperline-folio') {
    // 9. Kertas Folio Bergaris Paperline - Garis biru langit resmi dinas
    pCtx.fillStyle = '#fefefe';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.015);

    pCtx.strokeStyle = '#60a5fa';
    pCtx.lineWidth = 2.0;
    pCtx.beginPath();
    pCtx.moveTo(0, 100);
    pCtx.lineTo(pCanvas.width, 100);
    pCtx.stroke();

    pCtx.strokeStyle = '#93c5fd';
    pCtx.lineWidth = 1.3;
    for (let y = 145; y < pCanvas.height - 60; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

  } else if (presetName === 'mirage-lined') {
    // 10. Buku Tulis Mirage - Garis kebiruan lembut khas Mirage
    pCtx.fillStyle = '#fbfbfa';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.018);

    pCtx.strokeStyle = '#c5d2e0';
    pCtx.lineWidth = 1.3;
    for (let y = 145; y < pCanvas.height - 60; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }

    // Kotak Date di kanan atas
    pCtx.strokeStyle = '#94a3b8';
    pCtx.lineWidth = 1.0;
    pCtx.strokeRect(pCanvas.width - 200, 45, 170, 36);
    pCtx.fillStyle = '#64748b';
    pCtx.font = 'bold 11px sans-serif';
    pCtx.fillText('DATE:', pCanvas.width - 190, 68);

  } else if (presetName === 'paperone-hvs') {
    // 11. HVS PaperOne 70/80 GSM Putih Polos - Tanpa garis cetak
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.015);

  } else if (presetName === 'buram-cakaran') {
    // 12. Kertas Buram Cakaran Ujian Sekolah - Daur ulang berserat kasar
    pCtx.fillStyle = '#ede8dc';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.06);

    pCtx.strokeStyle = '#cbd5e1';
    pCtx.lineWidth = 1.2;
    for (let y = 145; y < pCanvas.height - 80; y += 46) {
      pCtx.beginPath();
      pCtx.moveTo(0, y);
      pCtx.lineTo(pCanvas.width, y);
      pCtx.stroke();
    }
  } else {
    // Fallback default
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    addPaperGrain(pCtx, pCanvas.width, pCanvas.height, 0.02);
  }

  paperCanvasCache[presetName] = pCanvas;
  return pCanvas;
}

// Add subtle realistic noise/grain
function addPaperGrain(context, width, height, opacity) {
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 250;
  grainCanvas.height = 250;
  const gCtx = grainCanvas.getContext('2d');
  const imgData = gCtx.createImageData(250, 250);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(Math.random() * 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = Math.floor(opacity * 255);
  }
  gCtx.putImageData(imgData, 0, 0);

  const pattern = context.createPattern(grainCanvas, 'repeat');
  context.fillStyle = pattern;
  context.fillRect(0, 0, width, height);
}

// Helper to extract non-empty header lines without placeholders or hyphens
function getHeaderLines() {
  const h = state.text.header;
  const name = (h.name || '').trim();
  const sClass = (h.studentClass || '').trim();
  const date = (h.date || '').trim();
  const subject = (h.subject || '').trim();

  const lines = [];

  // Line 1: Name and/or Class
  const line1Parts = [];
  if (name) line1Parts.push(`Nama: ${name}`);
  if (sClass) line1Parts.push(`Kelas/NIM: ${sClass}`);
  if (line1Parts.length > 0) {
    lines.push(line1Parts.join('    |    '));
  }

  // Line 2: Subject and/or Date
  const line2Parts = [];
  if (subject) line2Parts.push(`Mapel: ${subject}`);
  if (date) line2Parts.push(`Tanggal: ${date}`);
  if (line2Parts.length > 0) {
    lines.push(line2Parts.join('    |    '));
  }

  return lines;
}

// Strip markdown tokens (~strikeout~ and [tipex:word]) to measure true rendered glyph width
function getCleanText(str) {
  if (!str) return '';
  return str.replace(/~([^~]+)~/g, '$1').replace(/\[tipex:([^\]]+)\]/g, '$1');
}

// --- Text Pagination Engine ---
function paginateText() {
  const contentWidth = state.paper.width - state.tuning.marginLeft - state.tuning.marginRight;
  const availableHeight = state.paper.height - state.tuning.marginTop - state.tuning.marginBottom;
  const maxLinesPerPage = Math.max(1, Math.floor(availableHeight / state.tuning.lineHeight));

  // Prepare font context for measuring
  ctx.font = `${state.tuning.fontSize}px "${state.font.family}", cursive, sans-serif`;

  const paragraphs = state.text.raw.split('\n');
  const allLines = [];

  // Wrap each paragraph into lines (Header is now handled separately on canvas)
  paragraphs.forEach((para) => {
    if (para.trim() === '') {
      allLines.push({ text: '', isBlank: true });
      return;
    }

    // Auto-indent first line of paragraph if toggled
    let paraText = para;
    if (state.text.autoIndent && !paraText.startsWith('    ') && !paraText.startsWith('\t')) {
      paraText = '    ' + paraText;
    }

    const words = paraText.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const cleanTestLine = getCleanText(testLine);
      const metrics = ctx.measureText(cleanTestLine);
      const testWidth = metrics.width + (cleanTestLine.length * state.tuning.letterSpacing);

      if (testWidth > contentWidth && currentLine !== '') {
        allLines.push({ text: currentLine });
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      allLines.push({ text: currentLine });
    }
  });

  // Split lines into pages
  state.paginatedPages = [];
  let currentPageLines = [];

  allLines.forEach((line) => {
    if (currentPageLines.length >= maxLinesPerPage) {
      state.paginatedPages.push(currentPageLines);
      currentPageLines = [];
    }
    currentPageLines.push(line);
  });

  if (currentPageLines.length > 0 || state.paginatedPages.length === 0) {
    state.paginatedPages.push(currentPageLines);
  }

  state.view.totalPages = state.paginatedPages.length;
  if (state.view.currentPage > state.view.totalPages) {
    state.view.currentPage = state.view.totalPages;
  }

  updatePaginationUI();
}

function updatePaginationUI() {
  const total = Math.max(1, state.paginatedPages.length);
  state.view.totalPages = total;
  if (pageIndicator) {
    pageIndicator.textContent = `${total} Halaman`;
  }
  updatePageJumpPills(total);
}

// Generate Word-style page jump pills ([Hal 1] [Hal 2] [Hal 3])
function updatePageJumpPills(total) {
  if (!pageJumpContainer) return;
  pageJumpContainer.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'page-jump-pill';
    pill.textContent = `Hal ${i}`;
    pill.title = `Klik untuk langsung scroll ke Halaman ${i}`;
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetCard = document.getElementById(`pageCard-${i}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      pageJumpContainer.querySelectorAll('.page-jump-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
    if (i === 1) pill.classList.add('active');
    pageJumpContainer.appendChild(pill);
  }
}

// Synchronize DOM page-card elements in documentPagesContainer
function syncPageCards(totalPages) {
  if (!documentPagesContainer) return;

  const currentCards = documentPagesContainer.querySelectorAll('.page-card');
  const currentCount = currentCards.length;

  if (currentCount > totalPages) {
    for (let i = currentCount; i > totalPages; i--) {
      const el = document.getElementById(`pageCard-${i}`);
      if (el) el.remove();
    }
  } else if (currentCount < totalPages) {
    for (let i = currentCount + 1; i <= totalPages; i++) {
      const card = createPageCardElement(i);
      documentPagesContainer.appendChild(card);
    }
  }
}

// Create a single page card (Header + Viewport + Canvas)
function createPageCardElement(pageNum) {
  const card = document.createElement('div');
  card.className = 'page-card relative flex flex-col items-center max-w-full';
  card.id = `pageCard-${pageNum}`;

  card.innerHTML = `
    <div class="page-card-header w-full flex items-center justify-between text-xs font-semibold text-slate-600 mb-2 px-1 select-none">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <span class="px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold border border-blue-200 flex items-center gap-1 text-[11px] sm:text-xs">
          <i class="ph-bold ph-file-text text-blue-600"></i> Hal ${pageNum}
        </span>
        <span class="text-[11px] text-slate-400 hidden sm:inline">• Resolusi: ${state.paper.width} × ${state.paper.height} px</span>
      </div>
      <button type="button" class="download-single-btn px-2 sm:px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs active:scale-95" data-page="${pageNum}" title="Unduh gambar halaman ${pageNum}">
        <i class="ph-bold ph-download-simple"></i>
        <span>Unduh Hal ${pageNum}</span>
      </button>
    </div>
    <div class="page-viewport relative shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white max-w-full">
      <canvas class="page-canvas block cursor-default" data-page="${pageNum}"></canvas>
    </div>
  `;

  // Attach single page download
  const dlBtn = card.querySelector('.download-single-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportSpecificPage(pageNum);
    });
  }

  return card;
}

// --- Render Canvas Function (Multi-Page Word Style) ---
function render() {
  const totalPages = Math.max(1, state.paginatedPages.length);
  state.view.totalPages = totalPages;
  updatePaginationUI();

  // Keep fallback canvas in sync for measuring
  if (canvas) {
    let paperWidth = state.paper.width;
    let paperHeight = state.paper.height;
    if (state.paper.type === 'custom' && state.paper.customImage) {
      paperWidth = state.paper.customImage.naturalWidth || state.paper.customImage.width;
      paperHeight = state.paper.customImage.naturalHeight || state.paper.customImage.height;
      state.paper.width = paperWidth;
      state.paper.height = paperHeight;
    }
    canvas.width = paperWidth;
    canvas.height = paperHeight;
  }

  // Ensure DOM has page cards for all pages
  syncPageCards(totalPages);

  // Render each page into its respective canvas
  for (let p = 1; p <= totalPages; p++) {
    const pageCard = document.getElementById(`pageCard-${p}`);
    if (pageCard) {
      const pageCanvas = pageCard.querySelector('canvas.page-canvas');
      if (pageCanvas) {
        renderSinglePage(p, pageCanvas);
      }
    }
  }

  // Apply current zoom to all page viewports
  applyZoom();
}

// Render a single page to its dedicated canvas
function renderSinglePage(pageNum, pageCanvas) {
  const pageIndex = pageNum - 1;
  const pCtx = pageCanvas.getContext('2d');

  let paperWidth = state.paper.width;
  let paperHeight = state.paper.height;

  if (state.paper.type === 'custom' && state.paper.customImage) {
    paperWidth = state.paper.customImage.naturalWidth || state.paper.customImage.width;
    paperHeight = state.paper.customImage.naturalHeight || state.paper.customImage.height;
  }

  if (pageCanvas.width !== paperWidth || pageCanvas.height !== paperHeight) {
    pageCanvas.width = paperWidth;
    pageCanvas.height = paperHeight;
  }

  // 1. Draw Paper Background
  pCtx.save();
  pCtx.globalCompositeOperation = 'source-over';
  pCtx.globalAlpha = 1.0;

  if (state.paper.type === 'custom' && state.paper.customImage) {
    pCtx.drawImage(state.paper.customImage, 0, 0, pageCanvas.width, pageCanvas.height);
  } else {
    const presetCanvas = generatePresetPaper(state.paper.presetName);
    pCtx.drawImage(presetCanvas, 0, 0, pageCanvas.width, pageCanvas.height);
  }
  pCtx.restore();

  // 2. Render Text Lines for this Page
  const linesToDraw = state.paginatedPages[pageIndex] || [];
  const startY = state.tuning.marginTop;
  const startX = state.tuning.marginLeft;
  const lineHeight = state.tuning.lineHeight;

  pCtx.save();
  if (state.realism.blendMultiply) {
    pCtx.globalCompositeOperation = 'multiply';
  } else {
    pCtx.globalCompositeOperation = 'source-over';
  }

  pCtx.fillStyle = state.realism.inkColor;
  pCtx.textBaseline = 'alphabetic';

  // Render Header independently ONLY on Page 1 if any field is filled
  if (pageNum === 1) {
    const headerLines = getHeaderLines();
    if (headerLines.length > 0) {
      pCtx.save();
      pCtx.font = `${state.tuning.headerFontSize}px "${state.font.family}", cursive, sans-serif`;
      const hStartX = state.tuning.headerMarginLeft;
      const hStartY = state.tuning.headerMarginTop;
      const hLineHeight = state.tuning.headerLineHeight;

      headerLines.forEach((hText, hIdx) => {
        const hY = hStartY + (hIdx * hLineHeight);
        renderNaturalLine(pCtx, hText, hStartX, hY, -10 - hIdx, pageNum);
      });
      pCtx.restore();
    }
  }

  // Render Body Text Lines
  pCtx.font = `${state.tuning.fontSize}px "${state.font.family}", cursive, sans-serif`;
  linesToDraw.forEach((lineObj, lineIndex) => {
    if (lineObj.isBlank) return;
    const lineY = startY + (lineIndex * lineHeight);
    renderNaturalLine(pCtx, lineObj.text, startX, lineY, lineIndex, pageNum);
  });

  pCtx.restore();

  // 3. Post-Processing Camera & Scanner Filters (Anti-Curiga Dosen)
  applyCameraFilterPostProcess(pCtx, pageNum, paperWidth, paperHeight);

  // 4. Draw Alignment Guides (if toggled)
  if (state.view.showGuides) {
    drawVisualGuides(pCtx, linesToDraw.length, pageNum);
  }
}

// Cached procedural noise tile (256x256)
let cachedNoiseCanvas = null;

function getCameraNoiseCanvas() {
  if (!cachedNoiseCanvas) {
    const nSize = 256;
    const nCanvas = document.createElement('canvas');
    nCanvas.width = nSize;
    nCanvas.height = nSize;
    const nCtx = nCanvas.getContext('2d');
    const imgData = nCtx.createImageData(nSize, nSize);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Subtle monochrome ISO sensor grain
      const val = Math.floor(128 + (Math.random() - 0.5) * 110);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 40; // Base pattern alpha
    }
    nCtx.putImageData(imgData, 0, 0);
    cachedNoiseCanvas = nCanvas;
  }
  return cachedNoiseCanvas;
}

// Post-Processing Camera & Scanner Filters (Anti-Curiga Dosen)
function applyCameraFilterPostProcess(pCtx, pageNum, paperWidth, paperHeight) {
  const filter = state.cameraFilter;
  if (!filter) return;

  const preset = filter.preset || 'none';
  const shadowIntensity = (filter.shadowIntensity !== undefined ? filter.shadowIntensity : 25) / 100;
  const noiseIntensity = (filter.noiseIntensity !== undefined ? filter.noiseIntensity : 15) / 100;
  const hasFold = !!filter.paperFold;

  // 1. Preset Lighting & Color Tone
  if (preset === 'camscanner') {
    pCtx.save();
    // CamScanner paper brightening & contrast boost
    pCtx.globalCompositeOperation = 'screen';
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    pCtx.globalCompositeOperation = 'soft-light';
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // Subtle mobile document camera corner vignette
    const maxDim = Math.max(paperWidth, paperHeight);
    const vigGrad = pCtx.createRadialGradient(
      paperWidth * 0.5, paperHeight * 0.5, maxDim * 0.4,
      paperWidth * 0.5, paperHeight * 0.5, maxDim * 0.75
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.03)');
    vigGrad.addColorStop(1, 'rgba(15, 23, 42, 0.14)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = vigGrad;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);
    pCtx.restore();

  } else if (preset === 'desk_photo') {
    pCtx.save();
    // 1. Natural Ambient Room Light (Slightly brighter at top, gentle realistic falloff)
    const ambientGrad = pCtx.createLinearGradient(paperWidth * 0.2, 0, paperWidth * 0.8, paperHeight);
    ambientGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    ambientGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    ambientGrad.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = ambientGrad;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 2. Camera Lens Vignette (Gentle natural phone lens falloff at edges)
    const maxDim = Math.max(paperWidth, paperHeight);
    const camVig = pCtx.createRadialGradient(
      paperWidth * 0.5, paperHeight * 0.48, maxDim * 0.35,
      paperWidth * 0.5, paperHeight * 0.48, maxDim * 0.72
    );
    camVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    camVig.addColorStop(0.7, 'rgba(15, 23, 42, 0.025)');
    camVig.addColorStop(1, 'rgba(15, 23, 42, 0.08)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = camVig;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 3. Diffuse Smartphone Silhouette Shadow at bottom
    if (shadowIntensity > 0) {
      const sAlpha = shadowIntensity * 0.28;
      const shadowGrad = pCtx.createRadialGradient(
        paperWidth * 0.5, paperHeight * 1.05, paperWidth * 0.15,
        paperWidth * 0.5, paperHeight * 0.92, paperWidth * 0.75
      );
      shadowGrad.addColorStop(0, `rgba(15, 23, 42, ${sAlpha})`);
      shadowGrad.addColorStop(0.4, `rgba(30, 41, 59, ${sAlpha * 0.6})`);
      shadowGrad.addColorStop(0.8, `rgba(51, 65, 85, ${sAlpha * 0.2})`);
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.globalCompositeOperation = 'multiply';
      pCtx.fillStyle = shadowGrad;
      pCtx.fillRect(0, 0, paperWidth, paperHeight);
    }
    pCtx.restore();

  } else if (preset === 'warm_lamp') {
    pCtx.save();
    // 1. Cozy warm amber color wash over the whole paper (Soft golden study glow, no mud!)
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = 'rgba(255, 248, 230, 0.95)';
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 2. Desk Lamp Spotlight from top-left (Soft Ivory/Amber Highlight)
    const lampX = paperWidth * 0.25;
    const lampY = paperHeight * 0.15;
    const lampRadius = Math.max(paperWidth, paperHeight) * 0.85;
    const lampHighlight = pCtx.createRadialGradient(lampX, lampY, 30, lampX, lampY, lampRadius);
    lampHighlight.addColorStop(0, 'rgba(255, 235, 180, 0.18)');
    lampHighlight.addColorStop(0.4, 'rgba(255, 242, 205, 0.08)');
    lampHighlight.addColorStop(0.8, 'rgba(255, 250, 230, 0.02)');
    lampHighlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.globalCompositeOperation = 'screen';
    pCtx.fillStyle = lampHighlight;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 3. Very subtle ambient light falloff towards bottom-right (max 4% - clean and readable)
    const falloffGrad = pCtx.createLinearGradient(0, 0, paperWidth, paperHeight);
    falloffGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    falloffGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.015)');
    falloffGrad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = falloffGrad;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 4. Subtle smartphone shadow at bottom if slider > 0
    if (shadowIntensity > 0) {
      const sAlpha = shadowIntensity * 0.22;
      const shadowGrad = pCtx.createRadialGradient(
        paperWidth * 0.5, paperHeight * 1.02, paperWidth * 0.1,
        paperWidth * 0.5, paperHeight * 0.94, paperWidth * 0.75
      );
      shadowGrad.addColorStop(0, `rgba(30, 41, 59, ${sAlpha})`);
      shadowGrad.addColorStop(0.5, `rgba(30, 41, 59, ${sAlpha * 0.5})`);
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.globalCompositeOperation = 'multiply';
      pCtx.fillStyle = shadowGrad;
      pCtx.fillRect(0, 0, paperWidth, paperHeight);
    }
    pCtx.restore();

  } else if (preset === 'daylight') {
    pCtx.save();
    // 1. Soft Window Daylight Gradient (Fresh daylight coming from the left window)
    const windowGrad = pCtx.createLinearGradient(0, paperHeight * 0.2, paperWidth, paperHeight * 0.8);
    windowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    windowGrad.addColorStop(0.5, 'rgba(255, 250, 240, 0.03)');
    windowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
    pCtx.globalCompositeOperation = 'screen';
    pCtx.fillStyle = windowGrad;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 2. Fresh daylight atmosphere tint
    pCtx.globalCompositeOperation = 'soft-light';
    pCtx.fillStyle = 'rgba(240, 248, 255, 0.08)';
    pCtx.fillRect(0, 0, paperWidth, paperHeight);

    // 3. Subtle hand shadow if slider > 0
    if (shadowIntensity > 0) {
      const sAlpha = shadowIntensity * 0.20;
      const shadowGrad = pCtx.createRadialGradient(
        paperWidth * 0.8, paperHeight * 0.98, paperWidth * 0.1,
        paperWidth * 0.7, paperHeight * 0.92, paperWidth * 0.65
      );
      shadowGrad.addColorStop(0, `rgba(15, 23, 42, ${sAlpha})`);
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.globalCompositeOperation = 'multiply';
      pCtx.fillStyle = shadowGrad;
      pCtx.fillRect(0, 0, paperWidth, paperHeight);
    }
    pCtx.restore();

  } else if (preset === 'scanner_bw') {
    pCtx.save();
    // Convert canvas to high-contrast photocopy / document scanner
    const offCanvas = document.createElement('canvas');
    offCanvas.width = paperWidth;
    offCanvas.height = paperHeight;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(pCtx.canvas, 0, 0);

    pCtx.clearRect(0, 0, paperWidth, paperHeight);
    pCtx.filter = 'grayscale(100%) contrast(150%) brightness(102%)';
    pCtx.drawImage(offCanvas, 0, 0);
    pCtx.filter = 'none';

    // Scanner micro toner speckle texture
    const tonerNoise = getCameraNoiseCanvas();
    if (tonerNoise) {
      pCtx.globalCompositeOperation = 'multiply';
      pCtx.globalAlpha = 0.05;
      pCtx.fillStyle = pCtx.createPattern(tonerNoise, 'repeat');
      pCtx.fillRect(0, 0, paperWidth, paperHeight);
    }

    // Top scanner glass edge margin
    const scanEdge = pCtx.createLinearGradient(0, 0, 0, 16);
    scanEdge.addColorStop(0, 'rgba(0, 0, 0, 0.06)');
    scanEdge.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = scanEdge;
    pCtx.fillRect(0, 0, paperWidth, 16);
    pCtx.restore();

  } else if (preset === 'none' && shadowIntensity > 0) {
    pCtx.save();
    const sAlpha = shadowIntensity * 0.28;
    const shadowGrad = pCtx.createRadialGradient(
      paperWidth * 0.5, paperHeight * 1.05, paperWidth * 0.15,
      paperWidth * 0.5, paperHeight * 0.92, paperWidth * 0.75
    );
    shadowGrad.addColorStop(0, `rgba(15, 20, 30, ${sAlpha})`);
    shadowGrad.addColorStop(0.35, `rgba(25, 30, 40, ${sAlpha * 0.5})`);
    shadowGrad.addColorStop(0.7, `rgba(35, 40, 50, ${sAlpha * 0.18})`);
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = shadowGrad;
    pCtx.fillRect(0, 0, paperWidth, paperHeight);
    pCtx.restore();
  }

  // 2. Paper Fold / Crease (Lipatan Kertas Tengah)
  if (hasFold) {
    pCtx.save();
    const foldX = paperWidth * 0.5;
    const foldW = 16;
    // Shadow side (left)
    const foldShadow = pCtx.createLinearGradient(foldX - foldW, 0, foldX, 0);
    foldShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    foldShadow.addColorStop(0.7, 'rgba(0, 0, 0, 0.04)');
    foldShadow.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
    pCtx.globalCompositeOperation = 'multiply';
    pCtx.fillStyle = foldShadow;
    pCtx.fillRect(foldX - foldW, 0, foldW, paperHeight);

    // Highlight side (right)
    const foldHighlight = pCtx.createLinearGradient(foldX, 0, foldX + foldW, 0);
    foldHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.20)');
    foldHighlight.addColorStop(0.35, 'rgba(255, 255, 255, 0.07)');
    foldHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.globalCompositeOperation = 'screen';
    pCtx.fillStyle = foldHighlight;
    pCtx.fillRect(foldX, 0, foldW, paperHeight);
    pCtx.restore();
  }

    // 3. Sensor Noise / Grain (Bintik Kamera ISO)
    if (noiseIntensity > 0) {
      pCtx.save();
      const nCanvas = getCameraNoiseCanvas();
      const pattern = pCtx.createPattern(nCanvas, 'repeat');
      if (pattern) {
        pCtx.globalCompositeOperation = 'overlay';
        pCtx.globalAlpha = Math.min(0.25, noiseIntensity * 0.4);
        pCtx.fillStyle = pattern;
        pCtx.fillRect(0, 0, paperWidth, paperHeight);
      }
      pCtx.restore();
    }

    // 4. CamScanner Authentic Watermark
    if (filter.camScannerWatermark) {
      pCtx.save();
      pCtx.globalCompositeOperation = 'source-over';
      const wmText = 'Scanned with CamScanner';
      pCtx.font = 'bold 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      pCtx.textAlign = 'right';
      pCtx.textBaseline = 'bottom';

      const wmX = paperWidth - 45;
      const wmY = paperHeight - 35;

      pCtx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      pCtx.fillText(wmText, wmX, wmY);
      pCtx.restore();
    }
  }

  // Render words/characters with natural micro-variations to target 2D context
  function renderNaturalLine(pCtx, text, lineX, lineY, lineIndex, pageNum = 1) {
    const words = text.split(' ');
    let curX = lineX;
    const jitterIntensity = state.realism.jitter;
    const baseAlpha = state.realism.inkOpacity;
    const slantRad = (state.tuning.slant * Math.PI) / 180;
    const waveAmp = (state.cameraFilter && state.cameraFilter.baselineDrift !== undefined) 
      ? state.cameraFilter.baselineDrift 
      : 0.8;

    for (let w = 0; w < words.length; w++) {
      const rawWord = words[w];
      if (!rawWord) {
        curX += pCtx.measureText(' ').width + state.tuning.letterSpacing;
        continue;
      }

      // Parse Strikeout (~kata~) and Tip-Ex ([tipex:kata]) tokens
      let displayWord = rawWord;
      let isStrikeout = false;
      let isTipex = false;

      const strikeMatch = rawWord.match(/^~([^~]+)~(.*)$/);
      if (strikeMatch) {
        isStrikeout = true;
        displayWord = strikeMatch[1] + (strikeMatch[2] || '');
      }

      const tipexMatch = rawWord.match(/^\[tipex:([^\]]+)\](.*)$/);
      if (tipexMatch) {
        isTipex = true;
        displayWord = tipexMatch[1] + (tipexMatch[2] || '');
      }

      // Seed for word jitter (consistent per page and line)
      const seed = (lineIndex * 137 + w * 29 + pageNum * 53);
      const pseudoRand1 = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
      const pseudoRand2 = Math.cos(seed) * 10000 - Math.floor(Math.cos(seed) * 10000);

      // Organic Human Baseline Drift across paper width (slight wavy natural baseline)
      const lineProgress = (curX - lineX) / Math.max(1, (state.paper.width - lineX));
      const lineWave = waveAmp > 0 
        ? Math.sin(lineProgress * Math.PI * 2.2 + (lineIndex * 0.9) + (pageNum * 1.5)) * (waveAmp * 2.0)
        : 0;

      const wordDy = ((pseudoRand1 - 0.5) * jitterIntensity * 1.5) + lineWave;
      const wordRot = ((pseudoRand2 - 0.5) * jitterIntensity * 0.012) + slantRad;
      const wordAlpha = Math.max(0.7, Math.min(1.0, baseAlpha + (pseudoRand1 - 0.5) * 0.08));

      // Calculate word width
      let wordWidth = 0;
      if (state.tuning.letterSpacing !== 0) {
        for (let c = 0; c < displayWord.length; c++) {
          wordWidth += pCtx.measureText(displayWord[c]).width + state.tuning.letterSpacing;
        }
      } else {
        wordWidth = pCtx.measureText(displayWord).width;
      }

      pCtx.save();
      pCtx.translate(curX, lineY + wordDy);
      if (wordRot !== 0) {
        pCtx.rotate(wordRot);
      }

      // Render Tip-Ex Tape behind the word if active
      if (isTipex) {
        pCtx.save();
        pCtx.globalCompositeOperation = 'source-over';
        pCtx.fillStyle = '#f8fafc';
        pCtx.shadowColor = 'rgba(15, 23, 42, 0.16)';
        pCtx.shadowBlur = 3;
        pCtx.shadowOffsetY = 1;

        const txPad = 6;
        const txY = -state.tuning.fontSize * 0.92;
        const txH = state.tuning.fontSize * 1.18;
        const txW = wordWidth + (txPad * 2);

        pCtx.beginPath();
        if (pCtx.roundRect) {
          pCtx.roundRect(-txPad, txY, txW, txH, 2.5);
        } else {
          pCtx.rect(-txPad, txY, txW, txH);
        }
        pCtx.fill();

        // Soft white sheen highlight
        pCtx.shadowColor = 'transparent';
        pCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        pCtx.fillRect(-txPad + 1, txY + 1, txW - 2, 1.5);
        pCtx.restore();
      }

      pCtx.globalAlpha = wordAlpha;

      // Render character by character if letterSpacing is configured
      if (state.tuning.letterSpacing !== 0) {
        let charX = 0;
        for (let c = 0; c < displayWord.length; c++) {
          const char = displayWord[c];
          pCtx.fillText(char, charX, 0);
          charX += pCtx.measureText(char).width + state.tuning.letterSpacing;
        }
      } else {
        pCtx.fillText(displayWord, 0, 0);
      }

      // Render Strikeout (Coretan Pulpen Manusia) through the word if active
      if (isStrikeout) {
        pCtx.save();
        pCtx.strokeStyle = state.realism.inkColor;
        pCtx.lineWidth = Math.max(1.6, state.tuning.fontSize * 0.075);
        pCtx.lineCap = 'round';
        pCtx.globalAlpha = Math.min(1.0, wordAlpha * 0.95);

        const yMid = -state.tuning.fontSize * 0.32;
        const wExt = 4;

        // Primary stroke with human tilt
        pCtx.beginPath();
        pCtx.moveTo(-wExt, yMid - (pseudoRand1 - 0.5) * 3);
        pCtx.lineTo(wordWidth + wExt, yMid + (pseudoRand2 - 0.5) * 3);
        pCtx.stroke();

        // Secondary quick scratch
        pCtx.beginPath();
        pCtx.moveTo(-wExt + 2, yMid + 2.5);
        pCtx.lineTo(wordWidth + wExt - 1, yMid - 2);
        pCtx.stroke();

        pCtx.restore();
      }

      pCtx.restore();

      // Advance X by measured word width + space width
      const spaceWidth = pCtx.measureText(' ').width + state.tuning.letterSpacing;
      curX += wordWidth + spaceWidth;
    }
  }

// Draw visual guides overlay for calibration on target canvas
function drawVisualGuides(pCtx, lineCount, pageNum = 1) {
  pCtx.save();
  pCtx.globalCompositeOperation = 'source-over';

  // 1. Header Visual Guides (Amber) - Show on Page 1 only
  if (pageNum === 1) {
    const hLeft = state.tuning.headerMarginLeft;
    const hTop = state.tuning.headerMarginTop;
    const hLineH = state.tuning.headerLineHeight;
    const hLines = getHeaderLines();

    pCtx.strokeStyle = 'rgba(217, 119, 6, 0.85)'; // Amber dashed
    pCtx.lineWidth = 1.5;
    pCtx.setLineDash([6, 4]);

    // Header Top Baseline
    pCtx.beginPath();
    pCtx.moveTo(Math.max(0, hLeft - 40), hTop);
    pCtx.lineTo(state.paper.width - 40, hTop);
    pCtx.stroke();

    for (let i = 1; i < hLines.length; i++) {
      const y = hTop + (i * hLineH);
      pCtx.beginPath();
      pCtx.moveTo(hLeft, y);
      pCtx.lineTo(state.paper.width - 40, y);
      pCtx.stroke();
    }

    // Header Guide Label
    pCtx.fillStyle = 'rgba(217, 119, 6, 0.9)';
    pCtx.fillRect(hLeft, Math.max(0, hTop - 22), 170, 18);
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 10px sans-serif';
    pCtx.fillText('HEADER (Top: ' + hTop + 'px, Left: ' + hLeft + 'px)', hLeft + 6, Math.max(12, hTop - 9));
  }

  // 2. Body Text Margins bounding box
  pCtx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Red dashed line
  pCtx.lineWidth = 2;
  pCtx.setLineDash([8, 6]);

  const left = state.tuning.marginLeft;
  const right = state.paper.width - state.tuning.marginRight;
  const top = state.tuning.marginTop;
  const bottom = state.paper.height - state.tuning.marginBottom;

  // Vertical Left Margin Guide
  pCtx.beginPath();
  pCtx.moveTo(left, 0);
  pCtx.lineTo(left, state.paper.height);
  pCtx.stroke();

  // Vertical Right Margin Guide
  pCtx.beginPath();
  pCtx.moveTo(right, 0);
  pCtx.lineTo(right, state.paper.height);
  pCtx.stroke();

  // 3. Horizontal Line Baselines (Green dashed)
  pCtx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
  pCtx.lineWidth = 1.5;
  pCtx.setLineDash([4, 4]);

  const totalLines = Math.floor((bottom - top) / state.tuning.lineHeight);
  for (let i = 0; i <= totalLines; i++) {
    const y = top + (i * state.tuning.lineHeight);
    pCtx.beginPath();
    pCtx.moveTo(left - 30, y);
    pCtx.lineTo(right + 30, y);
    pCtx.stroke();

    // Line number badge
    pCtx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    pCtx.font = 'bold 12px sans-serif';
    pCtx.fillText(`${i + 1}`, Math.max(10, left - 45), y + 4);
  }

  // Guide body banner
  pCtx.fillStyle = 'rgba(239, 68, 68, 0.85)';
  pCtx.fillRect(left, top - 24, 180, 20);
  pCtx.fillStyle = '#ffffff';
  pCtx.font = 'bold 11px sans-serif';
  pCtx.fillText('ISI TULISAN (Baris 1)', left + 8, top - 10);

  pCtx.restore();
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Mobile View Switcher (Controls vs Preview di HP)
  const mobileTabControls = document.getElementById('mobileTabControls');
  const mobileTabPreview = document.getElementById('mobileTabPreview');
  const mobileFloatingToggleBtn = document.getElementById('mobileFloatingToggleBtn');
  const mobileFloatingIcon = document.getElementById('mobileFloatingIcon');
  const mobileFloatingText = document.getElementById('mobileFloatingText');
  const controlsPanel = document.getElementById('controlsPanel');
  const previewPanel = document.getElementById('previewPanel');

  function setMobileView(view) {
    const isPreview = (view === 'preview');
    if (isPreview) {
      if (controlsPanel) controlsPanel.classList.add('hidden');
      if (previewPanel) {
        previewPanel.classList.remove('hidden');
        previewPanel.classList.add('block');
        previewPanel.scrollLeft = 0;
        previewPanel.scrollTop = 0;
      }
      if (mobileTabPreview) {
        mobileTabPreview.className = 'flex-1 py-1.5 rounded-lg bg-white text-blue-600 shadow-xs text-center flex items-center justify-center gap-1.5 transition';
      }
      if (mobileTabControls) {
        mobileTabControls.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-center flex items-center justify-center gap-1.5 transition';
      }
      if (mobileFloatingToggleBtn && mobileFloatingIcon && mobileFloatingText) {
        mobileFloatingIcon.className = 'ph-bold ph-pencil-simple text-base';
        mobileFloatingText.textContent = 'Edit Teks & Gaya';
        mobileFloatingToggleBtn.className = 'lg:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-slate-900/35 border border-slate-700 transition-all cursor-pointer select-none';
      }
      fitCanvasToScreen();
    } else {
      if (controlsPanel) controlsPanel.classList.remove('hidden');
      if (previewPanel) {
        previewPanel.classList.add('hidden');
        previewPanel.classList.remove('block');
      }
      if (mobileTabControls) {
        mobileTabControls.className = 'flex-1 py-1.5 rounded-lg bg-white text-blue-600 shadow-xs text-center flex items-center justify-center gap-1.5 transition';
      }
      if (mobileTabPreview) {
        mobileTabPreview.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-center flex items-center justify-center gap-1.5 transition';
      }
      if (mobileFloatingToggleBtn && mobileFloatingIcon && mobileFloatingText) {
        mobileFloatingIcon.className = 'ph-bold ph-eye text-base';
        mobileFloatingText.textContent = 'Lihat Hasil Kertas';
        mobileFloatingToggleBtn.className = 'lg:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-blue-600/35 border border-blue-400/30 transition-all cursor-pointer select-none';
      }
    }
  }

  if (mobileTabControls) {
    mobileTabControls.addEventListener('click', () => setMobileView('controls'));
  }
  if (mobileTabPreview) {
    mobileTabPreview.addEventListener('click', () => setMobileView('preview'));
  }
  if (mobileFloatingToggleBtn) {
    mobileFloatingToggleBtn.addEventListener('click', () => {
      const isCurrentlyPreview = previewPanel && !previewPanel.classList.contains('hidden');
      setMobileView(isCurrentlyPreview ? 'controls' : 'preview');
    });
  }

  // Custom Font Upload
  fontFileInput.addEventListener('change', handleFontUpload);

  // Preset Font Buttons (12 Gaya Font)
  fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(b => {
        b.classList.remove('active', 'border-blue-500', 'text-blue-700');
        b.classList.add('border-slate-200', 'text-slate-700');
      });
      btn.classList.add('active', 'border-blue-500', 'text-blue-700');
      btn.classList.remove('border-slate-200', 'text-slate-700');
      state.font.family = btn.dataset.font;
      state.font.isCustom = false;
      fontStatusBadge.textContent = 'Preset: ' + btn.dataset.font;
      fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200';
      fontStorageInfo.classList.add('hidden');
      paginateText();
      render();
    });
  });

  // Custom Paper Upload
  paperFileInput.addEventListener('change', handlePaperUpload);

  // Paper Size Selector (A4, F4, B5)
  document.querySelectorAll('.paper-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.paper-size-btn').forEach(b => {
        b.classList.remove('active', 'border-blue-500', 'bg-blue-50/60', 'text-blue-700');
        b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      });
      btn.classList.add('active', 'border-blue-500', 'bg-blue-50/60', 'text-blue-700');
      btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');

      const sizeKey = btn.dataset.size;
      const sizeDef = PAPER_SIZES[sizeKey] || PAPER_SIZES.a4;
      state.paper.sizeName = sizeKey;
      state.paper.width = sizeDef.width;
      state.paper.height = sizeDef.height;

      // Clear cache so preset backgrounds regenerate to new dimensions
      for (const key in paperCanvasCache) {
        delete paperCanvasCache[key];
      }

      if (paperDimensionBadge) paperDimensionBadge.textContent = sizeDef.label;

      paginateText();
      render();
      fitCanvasToScreen();
    });
  });

  // Preset Paper Buttons (10 Macam Kertas)
  paperPresetContainer.querySelectorAll('.paper-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      paperPresetContainer.querySelectorAll('.paper-preset-btn').forEach(b => {
        b.classList.remove('active', 'border-blue-500', 'text-blue-700');
        b.classList.add('border-slate-200', 'text-slate-700');
      });
      btn.classList.add('active', 'border-blue-500', 'text-blue-700');
      btn.classList.remove('border-slate-200', 'text-slate-700');
      state.paper.type = 'preset';
      state.paper.presetName = btn.dataset.paper;
      state.paper.customImage = null;

      const sizeDef = PAPER_SIZES[state.paper.sizeName] || PAPER_SIZES.a4;
      state.paper.width = sizeDef.width;
      state.paper.height = sizeDef.height;

      paperStatusBadge.textContent = btn.querySelector('span').textContent;
      paperStorageInfo.classList.add('hidden');

      // Adapt margins & line height for distinct Indonesian paper types
      const p = btn.dataset.paper;
      if (p === 'sidu-kotak' || p === 'kiky-binder-grid' || p === 'kiky-binder-dot') {
        state.tuning.lineHeight = 30;
        state.tuning.marginTop = 90;
        state.tuning.marginLeft = 100;
        lineHeightSlider.value = 30;
        lineHeightVal.textContent = '30px';
        marginTopSlider.value = 90;
        marginTopVal.textContent = '90px';
        marginLeftSlider.value = 100;
        marginLeftVal.textContent = '100px';
      } else if (p === 'sidu-lined') {
        state.tuning.lineHeight = 46;
        state.tuning.marginTop = 145;
        state.tuning.marginLeft = 145;
        lineHeightSlider.value = 46;
        lineHeightVal.textContent = '46px';
        marginTopSlider.value = 145;
        marginTopVal.textContent = '145px';
        marginLeftSlider.value = 145;
        marginLeftVal.textContent = '145px';
      } else if (p === 'sidu-bigboss') {
        state.tuning.lineHeight = 46;
        state.tuning.marginTop = 140;
        state.tuning.marginLeft = 120;
        lineHeightSlider.value = 46;
        lineHeightVal.textContent = '46px';
        marginTopSlider.value = 140;
        marginTopVal.textContent = '140px';
        marginLeftSlider.value = 120;
        marginLeftVal.textContent = '120px';
      } else if (p === 'kiky-binder-line') {
        state.tuning.lineHeight = 44;
        state.tuning.marginTop = 140;
        state.tuning.marginLeft = 135;
        lineHeightSlider.value = 44;
        lineHeightVal.textContent = '44px';
        marginTopSlider.value = 140;
        marginTopVal.textContent = '140px';
        marginLeftSlider.value = 135;
        marginLeftVal.textContent = '135px';
      } else {
        // sidu-folio, kiky-executive, paperline-folio, mirage-lined, paperone-hvs, buram-cakaran
        state.tuning.lineHeight = 46;
        state.tuning.marginTop = 145;
        state.tuning.marginLeft = 120;
        lineHeightSlider.value = 46;
        lineHeightVal.textContent = '46px';
        marginTopSlider.value = 145;
        marginTopVal.textContent = '145px';
        marginLeftSlider.value = 120;
        marginLeftVal.textContent = '120px';
      }

      paginateText();
      render();
    });
  });

  // Text Inputs
  mainTextInput.addEventListener('input', () => {
    state.text.raw = mainTextInput.value;
    updateTextStats();
    paginateText();
    render();
  });

  clearTextBtn.addEventListener('click', () => {
    mainTextInput.value = '';
    state.text.raw = '';
    updateTextStats();
    paginateText();
    render();
  });

  // Quick Math / Symbol Insertion Buttons
  document.querySelectorAll('.quick-sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.sym;
      if (!sym) return;
      const start = mainTextInput.selectionStart ?? mainTextInput.value.length;
      const end = mainTextInput.selectionEnd ?? mainTextInput.value.length;
      const val = mainTextInput.value;
      mainTextInput.value = val.substring(0, start) + sym + val.substring(end);
      mainTextInput.selectionStart = mainTextInput.selectionEnd = start + sym.length;
      mainTextInput.focus();
      state.text.raw = mainTextInput.value;
      updateTextStats();
      paginateText();
      render();
    });
  });

  // Header Clear & Inputs
  if (clearHeaderBtn) {
    clearHeaderBtn.addEventListener('click', () => {
      headerNameInput.value = '';
      headerClassInput.value = '';
      headerDateInput.value = '';
      headerSubjectInput.value = '';
      state.text.header.name = '';
      state.text.header.studentClass = '';
      state.text.header.date = '';
      state.text.header.subject = '';
      render();
    });
  }

  [headerNameInput, headerClassInput, headerDateInput, headerSubjectInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      state.text.header.name = headerNameInput.value;
      state.text.header.studentClass = headerClassInput.value;
      state.text.header.date = headerDateInput.value;
      state.text.header.subject = headerSubjectInput.value;
      render();
    });
  });

  // Header Calibration Sliders (Terpisah)
  if (headerMarginTopSlider) {
    headerMarginTopSlider.addEventListener('input', (e) => {
      state.tuning.headerMarginTop = parseInt(e.target.value);
      headerMarginTopVal.textContent = `${state.tuning.headerMarginTop}px`;
      render();
    });
  }

  if (headerMarginLeftSlider) {
    headerMarginLeftSlider.addEventListener('input', (e) => {
      state.tuning.headerMarginLeft = parseInt(e.target.value);
      headerMarginLeftVal.textContent = `${state.tuning.headerMarginLeft}px`;
      render();
    });
  }

  if (headerLineHeightSlider) {
    headerLineHeightSlider.addEventListener('input', (e) => {
      state.tuning.headerLineHeight = parseInt(e.target.value);
      headerLineHeightVal.textContent = `${state.tuning.headerLineHeight}px`;
      render();
    });
  }

  if (headerFontSizeSlider) {
    headerFontSizeSlider.addEventListener('input', (e) => {
      state.tuning.headerFontSize = parseInt(e.target.value);
      headerFontSizeVal.textContent = `${state.tuning.headerFontSize}px`;
      render();
    });
  }

  // Body Text Calibration Sliders
  lineHeightSlider.addEventListener('input', (e) => {
    state.tuning.lineHeight = parseFloat(e.target.value);
    lineHeightVal.textContent = `${state.tuning.lineHeight}px`;
    paginateText();
    render();
  });

  fontSizeSlider.addEventListener('input', (e) => {
    state.tuning.fontSize = parseInt(e.target.value);
    fontSizeVal.textContent = `${state.tuning.fontSize}px`;
    paginateText();
    render();
  });

  marginTopSlider.addEventListener('input', (e) => {
    state.tuning.marginTop = parseInt(e.target.value);
    marginTopVal.textContent = `${state.tuning.marginTop}px`;
    paginateText();
    render();
  });

  marginLeftSlider.addEventListener('input', (e) => {
    state.tuning.marginLeft = parseInt(e.target.value);
    marginLeftVal.textContent = `${state.tuning.marginLeft}px`;
    paginateText();
    render();
  });

  marginRightSlider.addEventListener('input', (e) => {
    state.tuning.marginRight = parseInt(e.target.value);
    marginRightVal.textContent = `${state.tuning.marginRight}px`;
    paginateText();
    render();
  });

  letterSpacingSlider.addEventListener('input', (e) => {
    state.tuning.letterSpacing = parseFloat(e.target.value);
    letterSpacingVal.textContent = `${state.tuning.letterSpacing}px`;
    paginateText();
    render();
  });

  slantSlider.addEventListener('input', (e) => {
    state.tuning.slant = parseFloat(e.target.value);
    slantVal.textContent = `${state.tuning.slant}°`;
    render();
  });

  resetCalibrationBtn.addEventListener('click', () => {
    state.tuning = {
      fontSize: 26,
      lineHeight: 46,
      marginTop: 145,
      marginLeft: 130,
      marginRight: 80,
      marginBottom: 100,
      letterSpacing: 0,
      slant: 0,
      headerMarginTop: 95,
      headerMarginLeft: 130,
      headerLineHeight: 40,
      headerFontSize: 24,
    };

    // Reset Body controls
    lineHeightSlider.value = 46;
    lineHeightVal.textContent = '46px';
    fontSizeSlider.value = 26;
    fontSizeVal.textContent = '26px';
    marginTopSlider.value = 145;
    marginTopVal.textContent = '145px';
    marginLeftSlider.value = 130;
    marginLeftVal.textContent = '130px';
    marginRightSlider.value = 80;
    marginRightVal.textContent = '80px';
    letterSpacingSlider.value = 0;
    letterSpacingVal.textContent = '0px';
    slantSlider.value = 0;
    slantVal.textContent = '0°';

    // Reset Header controls
    if (headerMarginTopSlider) {
      headerMarginTopSlider.value = 95;
      headerMarginTopVal.textContent = '95px';
    }
    if (headerMarginLeftSlider) {
      headerMarginLeftSlider.value = 130;
      headerMarginLeftVal.textContent = '130px';
    }
    if (headerLineHeightSlider) {
      headerLineHeightSlider.value = 40;
      headerLineHeightVal.textContent = '40px';
    }
    if (headerFontSizeSlider) {
      headerFontSizeSlider.value = 24;
      headerFontSizeVal.textContent = '24px';
    }

    paginateText();
    render();
  });

  // Realism Controls
  inkColorContainer.querySelectorAll('.ink-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      inkColorContainer.querySelectorAll('.ink-btn').forEach(b => {
        b.classList.remove('active');
        b.style.transform = '';
      });
      btn.classList.add('active');
      state.realism.inkColor = btn.dataset.color;
      if (btn.dataset.opacity) {
        state.realism.inkOpacity = parseFloat(btn.dataset.opacity);
        inkOpacitySlider.value = Math.round(state.realism.inkOpacity * 100);
        inkOpacityVal.textContent = `${inkOpacitySlider.value}%`;
      }
      render();
    });
  });

  customColorPicker.addEventListener('input', (e) => {
    state.realism.inkColor = e.target.value;
    inkColorContainer.querySelectorAll('.ink-btn').forEach(b => b.classList.remove('active'));
    render();
  });

  jitterSlider.addEventListener('input', (e) => {
    state.realism.jitter = parseFloat(e.target.value);
    const j = state.realism.jitter;
    jitterVal.textContent = j === 0 ? 'Mati' : (j <= 2 ? 'Sedang' : 'Tinggi');
    render();
  });

  inkOpacitySlider.addEventListener('input', (e) => {
    state.realism.inkOpacity = parseInt(e.target.value) / 100;
    inkOpacityVal.textContent = `${e.target.value}%`;
    render();
  });

  blendModeToggle.addEventListener('change', (e) => {
    state.realism.blendMultiply = e.target.checked;
    render();
  });

  // Camera & Scanner Filters (Anti-Curiga Dosen)
  if (cameraFilterPresets) {
    cameraFilterPresets.querySelectorAll('.camera-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cameraFilterPresets.querySelectorAll('.camera-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterName = btn.getAttribute('data-filter');
        state.cameraFilter.preset = filterName;

        // Smart preset defaults
        if (filterName === 'camscanner') {
          state.cameraFilter.shadowIntensity = 0;
          state.cameraFilter.noiseIntensity = 12;
          state.cameraFilter.baselineDrift = 0.6;
        } else if (filterName === 'desk_photo') {
          state.cameraFilter.shadowIntensity = 25;
          state.cameraFilter.noiseIntensity = 15;
          state.cameraFilter.baselineDrift = 0.8;
        } else if (filterName === 'warm_lamp') {
          state.cameraFilter.shadowIntensity = 20;
          state.cameraFilter.noiseIntensity = 15;
          state.cameraFilter.baselineDrift = 0.8;
        } else if (filterName === 'daylight') {
          state.cameraFilter.shadowIntensity = 15;
          state.cameraFilter.noiseIntensity = 10;
          state.cameraFilter.baselineDrift = 0.8;
        } else if (filterName === 'scanner_bw') {
          state.cameraFilter.shadowIntensity = 0;
          state.cameraFilter.noiseIntensity = 20;
          state.cameraFilter.baselineDrift = 0.6;
        } else if (filterName === 'none') {
          state.cameraFilter.shadowIntensity = 0;
          state.cameraFilter.noiseIntensity = 0;
          state.cameraFilter.baselineDrift = 0;
        }

        // Sync slider controls
        if (filterShadowSlider) {
          filterShadowSlider.value = state.cameraFilter.shadowIntensity;
          filterShadowVal.textContent = `${state.cameraFilter.shadowIntensity}%`;
        }
        if (filterNoiseSlider) {
          filterNoiseSlider.value = state.cameraFilter.noiseIntensity;
          filterNoiseVal.textContent = `${state.cameraFilter.noiseIntensity}%`;
        }
        if (filterWaveSlider) {
          filterWaveSlider.value = state.cameraFilter.baselineDrift;
          filterWaveVal.textContent = `${state.cameraFilter.baselineDrift.toFixed(1)} px`;
        }

        render();
      });
    });
  }

  if (filterShadowSlider) {
    filterShadowSlider.addEventListener('input', (e) => {
      state.cameraFilter.shadowIntensity = parseInt(e.target.value, 10);
      filterShadowVal.textContent = `${state.cameraFilter.shadowIntensity}%`;
      render();
    });
  }

  if (filterNoiseSlider) {
    filterNoiseSlider.addEventListener('input', (e) => {
      state.cameraFilter.noiseIntensity = parseInt(e.target.value, 10);
      filterNoiseVal.textContent = `${state.cameraFilter.noiseIntensity}%`;
      render();
    });
  }

  if (filterWaveSlider) {
    filterWaveSlider.addEventListener('input', (e) => {
      state.cameraFilter.baselineDrift = parseFloat(e.target.value);
      filterWaveVal.textContent = `${state.cameraFilter.baselineDrift.toFixed(1)} px`;
      render();
    });
  }

  if (filterFoldToggle) {
    filterFoldToggle.addEventListener('change', (e) => {
      state.cameraFilter.paperFold = e.target.checked;
      render();
    });
  }

  // Interactive Info Tooltips (Hover & Click/Tap Toggle)
  document.querySelectorAll('.custom-tooltip-wrap').forEach(wrap => {
    const trigger = wrap.querySelector('.tooltip-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasActive = wrap.classList.contains('active');
        document.querySelectorAll('.custom-tooltip-wrap').forEach(w => w.classList.remove('active'));
        if (!wasActive) wrap.classList.add('active');
      });
    }
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-tooltip-wrap').forEach(w => w.classList.remove('active'));
  });

  // Guides Toggle
  toggleGuidesBtn.addEventListener('click', () => {
    state.view.showGuides = !state.view.showGuides;
    if (state.view.showGuides) {
      toggleGuidesBtn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-700');
    } else {
      toggleGuidesBtn.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-700');
    }
    render();
  });

  // Zoom Controls (Preview Layar)
  zoomInBtn.addEventListener('click', () => adjustZoom(0.1));
  zoomOutBtn.addEventListener('click', () => adjustZoom(-0.1));
  zoomFitBtn.addEventListener('click', () => fitCanvasToScreen());

  if (zoomReset100Btn) {
    zoomReset100Btn.addEventListener('click', () => {
      if (Math.abs(state.view.zoom - 1.0) < 0.05) {
        fitCanvasToScreen();
      } else {
        state.view.zoom = 1.0;
        applyZoom();
      }
    });
  }


  // Ctrl + Mouse Wheel Zoom & Drag-to-Pan on Preview Panel
  if (previewPanel) {
    previewPanel.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        adjustZoom(delta);
      }
    }, { passive: false });

    // Drag-to-Pan (Grab and Pan Navigation)
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollStartX = 0;
    let scrollStartY = 0;

    previewPanel.addEventListener('mousedown', (e) => {
      // Ignore clicks on buttons, inputs, links, or pagination
      if (e.target.closest('button, input, select, textarea, a, #paginationBar')) return;
      if (e.button === 0 || e.button === 1) { // Left or middle click
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollStartX = previewPanel.scrollLeft;
        scrollStartY = previewPanel.scrollTop;
        previewPanel.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      previewPanel.scrollLeft = scrollStartX - dx;
      previewPanel.scrollTop = scrollStartY - dy;
    });

    const stopPanning = () => {
      if (isPanning) {
        isPanning = false;
        previewPanel.style.cursor = '';
      }
    };

    window.addEventListener('mouseup', stopPanning);
    window.addEventListener('mouseleave', stopPanning);
  }

  // Pagination (Optional legacy fallback)
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (state.view.currentPage > 1) {
        state.view.currentPage--;
        updatePaginationUI();
        render();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (state.view.currentPage < state.view.totalPages) {
        state.view.currentPage++;
        updatePaginationUI();
        render();
      }
    });
  }

  // Remove Saved Font
  removeSavedFontBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteAssetFromDB('custom_font');
    state.font.family = 'Indie Flower';
    state.font.isCustom = false;
    state.font.customFontName = null;
    fontStatusBadge.textContent = 'Preset Aktif';
    fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600';
    fontStorageInfo.classList.add('hidden');
    fontFileInput.value = '';
    const defaultBtn = fontPresetContainer.querySelector('[data-font="Indie Flower"]');
    if (defaultBtn) defaultBtn.classList.add('active');
    paginateText();
    render();
  });

  // Remove Saved Paper
  removeSavedPaperBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteAssetFromDB('custom_paper');
    state.paper.type = 'preset';
    state.paper.presetName = 'notebook-lined';
    state.paper.customImage = null;
    state.paper.width = 1654;
    state.paper.height = 2338;
    paperStatusBadge.textContent = 'Buku Tulis Garis';
    paperStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600';
    paperStorageInfo.classList.add('hidden');
    paperFileInput.value = '';
    const defaultBtn = paperPresetContainer.querySelector('[data-paper="notebook-lined"]');
    if (defaultBtn) defaultBtn.classList.add('active');
    paginateText();
    render();
    fitCanvasToScreen();
  });

  // Human Error & Text Tools
  if (strikeoutTextBtn) {
    strikeoutTextBtn.addEventListener('click', () => {
      wrapSelectedText(mainTextInput, '~', '~', 'salah');
    });
  }

  if (tipexTextBtn) {
    tipexTextBtn.addEventListener('click', () => {
      wrapSelectedText(mainTextInput, '[tipex:', ']', 'koreksi');
    });
  }

  if (autoIndentToggle) {
    autoIndentToggle.addEventListener('change', (e) => {
      state.text.autoIndent = e.target.checked;
      paginateText();
      render();
    });
  }

  if (camScannerWatermarkToggle) {
    camScannerWatermarkToggle.addEventListener('change', (e) => {
      state.cameraFilter.camScannerWatermark = e.target.checked;
      render();
    });
  }

  // Exports (PNG & PDF)
  downloadPageBtn.addEventListener('click', exportCurrentPage);
  downloadAllPagesBtn.addEventListener('click', exportAllPages);
  if (downloadPdfNavBtn) {
    downloadPdfNavBtn.addEventListener('click', exportAllPagesAsPdf);
  }
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', exportAllPagesAsPdf);
  }
}

// --- Custom Font Loader Handler ---
async function handleFontUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const fontName = 'CustomHandwrittenFont_' + Date.now();
    const arrayBuffer = await file.arrayBuffer();

    // Periksa apakah file yang diupload adalah file lama yang terkena bug titik-titik
    if (window.opentype) {
      try {
        const parsed = opentype.parse(arrayBuffer.slice(0));
        const glyphs = Object.values(parsed.glyphs.glyphs || {});
        const userDrawnGlyphs = glyphs.filter(g => g.unicode && g.unicode > 32 && g.path && g.path.commands && g.path.commands.length > 0);
        const isDotBug = userDrawnGlyphs.length > 0 && userDrawnGlyphs.every(g => g.path.commands.length === 9 || (g.path.commands.length % 9 === 0 && g.path.commands.length <= 27));
        if (isDotBug) {
          alert('⚠️ PERHATIAN:\n\nFile "' + file.name + '" yang Anda pilih ini adalah file .TTF lama yang diunduh SEBELUM bug titik-titik diperbaiki (isi berkas di komputer Anda memang masih berupa titik).\n\nKABAR BAIK:\nCoretan asli tulisan tangan Anda masih tersimpan aman di aplikasi ini!\n\nSilakan klik tombol "Studio Font", lalu klik tombol "Terapkan ke Kertas" atau "Simpan File .TTF" untuk langsung menghasilkan dan menyimpan berkas font yang baru & normal.');
        }
      } catch (_) {}
    }

    const fontFace = new FontFace(fontName, arrayBuffer);
    
    fontStatusBadge.textContent = 'Memuat Font...';
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);

    state.font.family = fontName;
    state.font.isCustom = true;
    state.font.customFontName = file.name;

    // Save to IndexedDB
    await saveAssetToDB('custom_font', {
      name: file.name,
      fontFamily: fontName,
      buffer: arrayBuffer,
      date: Date.now()
    });

    // Update UI badge & storage label
    fontStatusBadge.textContent = 'Font Kustom Aktif';
    fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
    savedFontLabel.textContent = file.name;
    fontStorageInfo.classList.remove('hidden');

    // Deselect preset buttons
    fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(b => b.classList.remove('active'));

    paginateText();
    render();
  } catch (err) {
    alert('Gagal memuat file font. Pastikan format file adalah .ttf, .otf, atau .woff yang valid.\n\nError: ' + err.message);
  }
}

// --- Custom Paper Image Upload Handler ---
function handlePaperUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = async () => {
      state.paper.type = 'custom';
      state.paper.customImage = img;
      state.paper.width = img.naturalWidth;
      state.paper.height = img.naturalHeight;

      // Save to IndexedDB
      await saveAssetToDB('custom_paper', {
        name: file.name,
        dataUrl: dataUrl,
        date: Date.now()
      });

      paperStatusBadge.textContent = 'Foto Kustom';
      paperStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
      savedPaperLabel.textContent = file.name;
      paperStorageInfo.classList.remove('hidden');

      // Deselect preset buttons
      paperPresetContainer.querySelectorAll('.paper-preset-btn').forEach(b => b.classList.remove('active'));

      paginateText();
      render();
      fitCanvasToScreen();
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// --- Zoom & Sizing (Kaca Pembesar Layar) ---
function adjustZoom(delta) {
  state.view.zoom = Math.max(0.15, Math.min(2.5, state.view.zoom + delta));
  applyZoom();
}

function fitCanvasToScreen() {
  const container = previewPanel || (documentPagesContainer ? documentPagesContainer.parentElement : null);
  if (!container) return;

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Di HP: paskan ke lebar layar agar kertas tampil proporsional (~92% lebar layar) dan terbaca jelas
    const availWidth = Math.max(260, container.clientWidth - 20);
    const scaleX = availWidth / state.paper.width;
    state.view.zoom = Math.max(0.18, Math.min(scaleX, 0.95));
  } else {
    // Di Desktop: paskan ke lebar dan tinggi viewport
    const availWidth = Math.max(280, container.clientWidth - 56);
    const availHeight = Math.max(280, container.clientHeight - 130);
    const scaleX = availWidth / state.paper.width;
    const scaleY = availHeight / state.paper.height;
    state.view.zoom = Math.max(0.15, Math.min(scaleX, scaleY, 0.95));
  }

  applyZoom();

  // Pastikan posisi scroll horizontal selalu kembali ke 0 agar kertas tidak terpotong di kiri
  if (previewPanel) {
    previewPanel.scrollLeft = 0;
  }
}

function applyZoom() {
  const w = Math.round(state.paper.width * state.view.zoom);
  const h = Math.round(state.paper.height * state.view.zoom);

  // Resize every page card's viewport and canvas
  if (documentPagesContainer) {
    const canvases = documentPagesContainer.querySelectorAll('canvas.page-canvas');
    canvases.forEach(c => {
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      const vp = c.closest('.page-viewport');
      if (vp) {
        vp.style.width = `${w}px`;
        vp.style.height = `${h}px`;
      }
    });
  }

  // Also sync fallback canvas
  if (canvas) {
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  if (canvasViewport) {
    canvasViewport.style.width = `${w}px`;
    canvasViewport.style.height = `${h}px`;
  }

  const pct = `${Math.round(state.view.zoom * 100)}%`;
  if (zoomLevel) zoomLevel.textContent = pct;
  if (zoomLevelText) zoomLevelText.textContent = pct;
}

function handleResize() {
  fitCanvasToScreen();
}

function updateTextStats() {
  const str = mainTextInput.value.trim();
  const charCount = str.length;
  const wordCount = str ? str.split(/\s+/).length : 0;
  charCountLabel.textContent = `${charCount} karakter | ${wordCount} kata`;
}

// --- Export Functions ---
function exportSpecificPage(pageNum) {
  const pageCard = document.getElementById(`pageCard-${pageNum}`);
  if (!pageCard) return;

  const originalGuides = state.view.showGuides;
  state.view.showGuides = false;

  const pageCanvas = pageCard.querySelector('canvas.page-canvas');
  renderSinglePage(pageNum, pageCanvas);

  const link = document.createElement('a');
  link.download = `TulisanKu_Halaman_${pageNum}.png`;
  link.href = pageCanvas.toDataURL('image/png', 1.0);
  link.click();

  state.view.showGuides = originalGuides;
  renderSinglePage(pageNum, pageCanvas);
}

function exportCurrentPage() {
  const total = state.view.totalPages;
  if (total > 1) {
    exportAllPages();
  } else {
    exportSpecificPage(1);
  }
}

async function exportAllPages() {
  const total = state.view.totalPages;
  if (total <= 1) {
    exportSpecificPage(1);
    return;
  }

  const originalGuides = state.view.showGuides;
  state.view.showGuides = false;

  const originalBtnContent = downloadAllPagesBtn.innerHTML;
  downloadAllPagesBtn.disabled = true;
  downloadAllPagesBtn.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> <span>Mengunduh...</span>';

  for (let p = 1; p <= total; p++) {
    const pageCard = document.getElementById(`pageCard-${p}`);
    if (pageCard) {
      const pageCanvas = pageCard.querySelector('canvas.page-canvas');
      renderSinglePage(p, pageCanvas);

      const link = document.createElement('a');
      link.download = `TulisanKu_Halaman_${p}_dari_${total}.png`;
      link.href = pageCanvas.toDataURL('image/png', 1.0);
      link.click();

      // Delay between downloads so browser doesn't block multi-downloads
      await new Promise(r => setTimeout(r, 450));
    }
  }

  state.view.showGuides = originalGuides;
  render();

  downloadAllPagesBtn.disabled = false;
  downloadAllPagesBtn.innerHTML = originalBtnContent;
}

// Wrap selected text in textarea with prefix/suffix (for strikeout and tip-ex)
function wrapSelectedText(textarea, before, after, defaultWord) {
  if (!textarea) return;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const selected = textarea.value.substring(start, end);
  const replacement = selected ? `${before}${selected}${after}` : `${before}${defaultWord}${after}`;

  textarea.focus();
  textarea.setRangeText(replacement, start, end, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Export all pages into a single compiled PDF file (jsPDF)
async function exportAllPagesAsPdf() {
  const total = state.view.totalPages;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('Pustaka PDF sedang dimuat di browser. Silakan coba kembali sesaat lagi.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdfBtn = document.getElementById('downloadPdfBtn');
  const navPdfBtn = document.getElementById('downloadPdfNavBtn');
  const origBtnText = pdfBtn ? pdfBtn.innerHTML : '';
  const origNavText = navPdfBtn ? navPdfBtn.innerHTML : '';

  if (pdfBtn) {
    pdfBtn.disabled = true;
    pdfBtn.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> <span>Menyusun PDF...</span>';
  }
  if (navPdfBtn) {
    navPdfBtn.disabled = true;
    navPdfBtn.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> <span>Proses PDF...</span>';
  }

  try {
    const originalGuides = state.view.showGuides;
    state.view.showGuides = false;

    let paperWidth = state.paper.width;
    let paperHeight = state.paper.height;
    const isLandscape = paperWidth > paperHeight;
    // Standard PDF points (72 DPI vs 200 DPI canvas): pt = px * (72/200) = px * 0.36
    const ptWidth = paperWidth * 0.36;
    const ptHeight = paperHeight * 0.36;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [ptWidth, ptHeight]
    });

    for (let p = 1; p <= total; p++) {
      const pageCard = document.getElementById(`pageCard-${p}`);
      if (pageCard) {
        const pageCanvas = pageCard.querySelector('canvas.page-canvas');
        renderSinglePage(p, pageCanvas);

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.94);
        if (p > 1) {
          pdf.addPage([ptWidth, ptHeight], isLandscape ? 'landscape' : 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight, undefined, 'FAST');
      }
    }

    state.view.showGuides = originalGuides;
    render();

    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`TulisanKu_Tugas_${timestamp}.pdf`);
  } catch (err) {
    console.error('Gagal membuat PDF:', err);
    alert('Terjadi kesalahan saat menyusun PDF: ' + err.message);
  } finally {
    if (pdfBtn) {
      pdfBtn.disabled = false;
      pdfBtn.innerHTML = origBtnText;
    }
    if (navPdfBtn) {
      navPdfBtn.disabled = false;
      navPdfBtn.innerHTML = origNavText;
    }
  }
}

// =================================================================
// --- STUDIO PEMBUAT FONT TULIS TANGAN (OPENTYPE.JS ENGINE) ---
// =================================================================

const STUDIO_CHAR_SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  numbers: '0123456789'.split(''),
  punct: ['.', ',', '!', '?', '-', ':', ';', '(', ')', '"', "'", '/'],
  math: ['≤', '≥', '=', '+', '-', '×', '÷', '<', '>', '≠', '±', '%', '√', '^', 'π', '∞', '≈', '∑']
};

function getAllStudioChars() {
  const combined = [
    ...STUDIO_CHAR_SETS.lower,
    ...STUDIO_CHAR_SETS.upper,
    ...STUDIO_CHAR_SETS.numbers,
    ...STUDIO_CHAR_SETS.punct,
    ...STUDIO_CHAR_SETS.math
  ];
  return Array.from(new Set(combined));
}

const CHAR_DESCRIPTIONS = {
  'a': "Huruf kecil 'a' (antara Garis Atas & Garis Pijakan)",
  'b': "Huruf kecil 'b' (tiang ke Garis Atas, duduk di Garis Pijakan)",
  'c': "Huruf kecil 'c' (antara Garis Atas & Garis Pijakan)",
  'd': "Huruf kecil 'd' (tiang ke Garis Atas, duduk di Garis Pijakan)",
  'e': "Huruf kecil 'e' (antara Garis Atas & Garis Pijakan)",
  'f': "Huruf kecil 'f' (tiang ke Garis Atas, duduk di Garis Pijakan)",
  'g': "Huruf kecil 'g' (badan di Garis Pijakan, ekor ke Garis Ekor)",
  'h': "Huruf kecil 'h' (tiang ke Garis Atas, duduk di Garis Pijakan)",
  'i': "Huruf kecil 'i' (titik di Garis Atas, duduk di Garis Pijakan)",
  'j': "Huruf kecil 'j' (titik di Garis Atas, ekor ke Garis Ekor)",
  'k': "Huruf kecil 'k' (tiang ke Garis Atas, kaki di Garis Pijakan)",
  'l': "Huruf kecil 'l' (tiang tegak dari Garis Atas ke Garis Pijakan)",
  'm': "Huruf kecil 'm' (duduk di Garis Pijakan, puncak di Garis Atas)",
  'n': "Huruf kecil 'n' (duduk di Garis Pijakan, puncak di Garis Atas)",
  'o': "Huruf kecil 'o' (lingkaran antara Garis Atas & Garis Pijakan)",
  'p': "Huruf kecil 'p' (kepala di Garis Pijakan, ekor ke Garis Ekor)",
  'q': "Huruf kecil 'q' (kepala di Garis Pijakan, ekor ke Garis Ekor)",
  'r': "Huruf kecil 'r' (tiang di Garis Pijakan, kait di Garis Atas)",
  's': "Huruf kecil 's' (antara Garis Atas & Garis Pijakan)",
  't': "Huruf kecil 't' (tiang ke Garis Atas, duduk di Garis Pijakan)",
  'u': "Huruf kecil 'u' (cawan duduk di Garis Pijakan, puncak di Garis Atas)",
  'v': "Huruf kecil 'v' (sudut lancip di Garis Pijakan, puncak di Garis Atas)",
  'w': "Huruf kecil 'w' (duduk di Garis Pijakan, puncak di Garis Atas)",
  'x': "Huruf kecil 'x' (silang antara Garis Atas & Garis Pijakan)",
  'y': "Huruf kecil 'y' (badan di Garis Pijakan, ekor ke Garis Ekor)",
  'z': "Huruf kecil 'z' (antara Garis Atas & Garis Pijakan)",
  '≤': "Simbol '≤' (kurang dari atau sama dengan)",
  '≥': "Simbol '≥' (lebih dari atau sama dengan)",
  '=': "Simbol '=' (dua garis mendatar sejajar)",
  '+': "Simbol '+' (tanda tambah tegak & mendatar)",
  '-': "Simbol '-' (tanda kurang / minus mendatar)",
  '×': "Simbol '×' (tanda perkalian silang)",
  '÷': "Simbol '÷' (tanda bagi dengan dua titik)",
  '<': "Simbol '<' (sudut runcing ke kiri)",
  '>': "Simbol '>' (sudut runcing ke kanan)",
  '≠': "Simbol '≠' (sama dengan dicoret miring)",
  '±': "Simbol '±' (tanda tambah di atas garis minus)",
  '%': "Simbol '%' (persentase)",
  '√': "Simbol '√' (akar kuadrat matematika)",
  '^': "Simbol '^' (tanda pangkat / caret)",
  'π': "Simbol 'π' (simbol pi dua kaki)",
  '∞': "Simbol '∞' (angka delapan tidur / tak hingga)",
  '≈': "Simbol '≈' (dua gelombang mendekati)",
  '∑': "Simbol '∑' (sigma kapital / jumlahan)"
};

const studioState = {
  isOpen: false,
  currentChar: 'a',
  currentCategory: 'lower',
  penWidth: 12,
  glyphs: {}, // char -> Array of strokes: [ [ {x, y}, ... ], ... ]
  baseTemplateFont: null,
  isDrawing: false,
  currentStroke: []
};

// DOM references for Studio
let fontStudioModal, closeFontStudioBtn, openFontStudioBtn, studioProgressBadge;
let studioCategoryTabs, studioCharGrid, activeCharDisplay, activeCharHint;
let prevCharBtn, nextCharBtn, glyphCanvas, gctx;
let penWidthSlider, penWidthVal, undoStrokeBtn, clearGlyphBtn;
let studioFontNameInput, studioSmartFallbackToggle, downloadTtfBtn, applyStudioFontBtn;

// Auto-Save Studio Glyphs to LocalStorage
function saveStudioToLocalStorage() {
  try {
    localStorage.setItem('tulisanku_studio_glyphs', JSON.stringify(studioState.glyphs));
    if (studioFontNameInput && studioFontNameInput.value) {
      localStorage.setItem('tulisanku_studio_fontname', studioFontNameInput.value.trim());
    }
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function loadStudioFromLocalStorage() {
  try {
    const saved = localStorage.getItem('tulisanku_studio_glyphs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        studioState.glyphs = parsed;
      }
    }
    const savedName = localStorage.getItem('tulisanku_studio_fontname');
    if (savedName && studioFontNameInput) {
      studioFontNameInput.value = savedName;
    }
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
  }
}

function initFontStudio() {
  fontStudioModal = document.getElementById('fontStudioModal');
  closeFontStudioBtn = document.getElementById('closeFontStudioBtn');
  openFontStudioBtn = document.getElementById('openFontStudioBtn');
  studioProgressBadge = document.getElementById('studioProgressBadge');
  studioCategoryTabs = document.getElementById('studioCategoryTabs');
  studioCharGrid = document.getElementById('studioCharGrid');
  activeCharDisplay = document.getElementById('activeCharDisplay');
  activeCharHint = document.getElementById('activeCharHint');
  prevCharBtn = document.getElementById('prevCharBtn');
  nextCharBtn = document.getElementById('nextCharBtn');
  glyphCanvas = document.getElementById('glyphCanvas');
  gctx = glyphCanvas.getContext('2d');
  penWidthSlider = document.getElementById('penWidthSlider');
  penWidthVal = document.getElementById('penWidthVal');
  undoStrokeBtn = document.getElementById('undoStrokeBtn');
  clearGlyphBtn = document.getElementById('clearGlyphBtn');
  studioFontNameInput = document.getElementById('studioFontNameInput');
  studioSmartFallbackToggle = document.getElementById('studioSmartFallbackToggle');
  downloadTtfBtn = document.getElementById('downloadTtfBtn');
  applyStudioFontBtn = document.getElementById('applyStudioFontBtn');

  // Restore saved letters from localStorage
  loadStudioFromLocalStorage();
  updateProgressBadge();

  if (studioFontNameInput) {
    studioFontNameInput.addEventListener('input', saveStudioToLocalStorage);
  }

  // Load base template font in background for smart fallback
  if (window.opentype) {
    opentype.load('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/indieflower/IndieFlower-Regular.ttf', (err, font) => {
      if (!err && font) {
        studioState.baseTemplateFont = font;
      }
    });
  }

  // Bind Open & Close
  if (openFontStudioBtn) openFontStudioBtn.addEventListener('click', openStudio);
  if (closeFontStudioBtn) closeFontStudioBtn.addEventListener('click', closeStudio);

  if (fontStudioModal) {
    fontStudioModal.addEventListener('click', (e) => {
      if (e.target === fontStudioModal) closeStudio();
    });
  }

  // Category Tabs
  if (studioCategoryTabs) {
    studioCategoryTabs.querySelectorAll('.studio-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        studioCategoryTabs.querySelectorAll('.studio-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        studioState.currentCategory = btn.dataset.cat;
        renderCharGrid();
        const list = STUDIO_CHAR_SETS[studioState.currentCategory];
        if (list && !list.includes(studioState.currentChar)) {
          selectStudioChar(list[0]);
        }
      });
    });
  }

  // Pen Width Slider
  if (penWidthSlider) {
    penWidthSlider.addEventListener('input', (e) => {
      studioState.penWidth = parseInt(e.target.value);
      penWidthVal.textContent = `${studioState.penWidth}px`;
      drawGlyphCanvas();
    });
  }

  // Undo & Clear
  if (undoStrokeBtn) undoStrokeBtn.addEventListener('click', undoLastStroke);
  if (clearGlyphBtn) clearGlyphBtn.addEventListener('click', clearCurrentGlyph);

  // Navigation
  if (prevCharBtn) prevCharBtn.addEventListener('click', () => navigateChar(-1));
  if (nextCharBtn) nextCharBtn.addEventListener('click', () => navigateChar(1));

  // Canvas Drawing
  setupGlyphCanvasDrawing();

  // Export & Apply
  if (applyStudioFontBtn) applyStudioFontBtn.addEventListener('click', handleApplyStudioFont);
  if (downloadTtfBtn) downloadTtfBtn.addEventListener('click', handleDownloadTtf);

  // Jika pengguna sudah memiliki gambar karakter di Studio Font,
  // kompilasi otomatis versi terbaru agar pengguna langsung melihat hasil tulisan tangannya (bukan titik-titik lama)
  try {
    const allChars = getAllStudioChars();
    const hasAnyDrawn = allChars.some(c => hasGlyph(c));
    if (hasAnyDrawn && (!state.font.isCustom || state.font.family.includes('Font-Tulisanku') || state.font.family.includes('TulisanKu-Font') || state.font.family === 'Indie Flower')) {
      const baseName = (studioFontNameInput ? studioFontNameInput.value.trim() : '') || 'Font-Tulisanku';
      const cleanName = baseName.replace(/\s+/g, '-');
      const uniqueFamily = `${cleanName}_${Date.now()}`;
      compileStudioFont(cleanName).then(async (arrayBuffer) => {
        const fontFace = new FontFace(uniqueFamily, arrayBuffer);
        const loadedFont = await fontFace.load();

        Array.from(document.fonts).forEach(f => {
          if (f.family.startsWith(cleanName) || f.family.startsWith('CustomHandwrittenFont_')) {
            document.fonts.delete(f);
          }
        });

        document.fonts.add(loadedFont);
        await saveAssetToDB('custom_font', {
          name: `${cleanName}.ttf`,
          fontFamily: uniqueFamily,
          isStudioFont: true,
          buffer: arrayBuffer,
          date: Date.now()
        });
        state.font.family = uniqueFamily;
        state.font.isCustom = true;
        state.font.customFontName = `${cleanName}.ttf`;
        fontStatusBadge.textContent = 'Font Studio Aktif';
        fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200';
        savedFontLabel.textContent = `${cleanName}.ttf`;
        fontStorageInfo.classList.remove('hidden');
        fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(b => b.classList.remove('active'));
        paginateText();
        render();
      }).catch(err => console.warn('Auto-refresh studio font skipped:', err));
    }
  } catch (e) {
    console.warn('Auto-refresh studio font check:', e);
  }
}

function openStudio() {
  studioState.isOpen = true;
  fontStudioModal.classList.remove('hidden');
  renderCharGrid();
  selectStudioChar(studioState.currentChar || 'a');
  updateProgressBadge();
}

function closeStudio() {
  studioState.isOpen = false;
  fontStudioModal.classList.add('hidden');
}

function renderCharGrid() {
  if (!studioCharGrid) return;
  studioCharGrid.innerHTML = '';
  const chars = STUDIO_CHAR_SETS[studioState.currentCategory] || [];

  chars.forEach(char => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `studio-char-btn ${char === studioState.currentChar ? 'active' : ''} ${hasGlyph(char) ? 'has-glyph' : ''}`;
    btn.textContent = char;
    btn.addEventListener('click', () => selectStudioChar(char));
    studioCharGrid.appendChild(btn);
  });
}

const ASCENDER_CHARS = 'bdfhklt';
const CAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DESCENDER_CHARS = 'gjypq';
const MATH_CHARS = '≤≥=+-×÷<>≠±%√^π∞≈∑';
const TALL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789bdfhklt!?()/≤≥=+-×÷<>≠±%√^π∞≈∑';

function updateCharGuideInfo(char) {
  const charTypeBadge = document.getElementById('charTypeBadge');
  const charGuideInstruction = document.getElementById('charGuideInstruction');
  const charGuideBar = document.getElementById('charGuideBar');
  if (!charTypeBadge || !charGuideInstruction) return;

  if (MATH_CHARS.includes(char)) {
    charTypeBadge.textContent = 'Simbol MTK';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Tulis simbol matematika seimbang di antara Garis Atas & Pijakan';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs transition-all';
  } else if (DESCENDER_CHARS.includes(char)) {
    charTypeBadge.textContent = 'Huruf Berekor';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Badan di Garis Pijakan, tarik ekor ke Garis Ekor (merah)';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs transition-all';
  } else if (ASCENDER_CHARS.includes(char)) {
    charTypeBadge.textContent = 'Huruf Bertiang';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Tiang sampai Garis Atas, duduk di Garis Pijakan (biru)';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs transition-all';
  } else if (CAP_CHARS.includes(char)) {
    charTypeBadge.textContent = 'Huruf Kapital / Angka';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Ukuran kapital umum: dari Garis Pijakan (biru) sampai Garis Atas';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between text-xs transition-all';
  } else if ('.!?:;,()\"\'/-'.includes(char)) {
    charTypeBadge.textContent = 'Tanda Baca';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Tulis tanda baca di sekitar Garis Pijakan (biru)';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between text-xs transition-all';
  } else {
    // Normal flat lowercase (a, c, e, m, n, o, r, s, u, v, w, x, z)
    charTypeBadge.textContent = 'Huruf Kecil';
    charTypeBadge.className = 'px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wide shrink-0';
    charGuideInstruction.textContent = 'Tulis pas di antara Garis Atas dan Garis Pijakan (biru)';
    if (charGuideBar) charGuideBar.className = 'w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs transition-all';
  }
}

function selectStudioChar(char) {
  studioState.currentChar = char;
  if (activeCharDisplay) activeCharDisplay.textContent = char;
  if (activeCharHint) {
    activeCharHint.textContent = CHAR_DESCRIPTIONS[char] || `Tulis karakter '${char}' di dalam kanvas`;
  }

  updateCharGuideInfo(char);

  if (studioCharGrid) {
    studioCharGrid.querySelectorAll('.studio-char-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === char);
    });
  }

  drawGlyphCanvas();
}

function navigateChar(delta) {
  const allChars = getAllStudioChars();
  let idx = allChars.indexOf(studioState.currentChar);
  if (idx === -1) idx = 0;
  idx = (idx + delta + allChars.length) % allChars.length;
  const nextChar = allChars[idx];

  for (const [cat, list] of Object.entries(STUDIO_CHAR_SETS)) {
    if (list.includes(nextChar)) {
      if (studioState.currentCategory !== cat) {
        studioState.currentCategory = cat;
        if (studioCategoryTabs) {
          studioCategoryTabs.querySelectorAll('.studio-cat-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === cat);
          });
        }
        renderCharGrid();
      }
      break;
    }
  }

  selectStudioChar(nextChar);
}

function hasGlyph(char) {
  return studioState.glyphs[char] && studioState.glyphs[char].length > 0;
}

function updateProgressBadge() {
  if (!studioProgressBadge) return;
  const allChars = getAllStudioChars();
  const drawnCount = allChars.filter(c => hasGlyph(c)).length;
  studioProgressBadge.textContent = `${drawnCount} / ${allChars.length} Huruf Digambar`;
}

function setupGlyphCanvasDrawing() {
  if (!glyphCanvas) return;

  const getCanvasPos = (e) => {
    const rect = glyphCanvas.getBoundingClientRect();
    const scaleX = glyphCanvas.width / rect.width;
    const scaleY = glyphCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  glyphCanvas.addEventListener('pointerdown', (e) => {
    glyphCanvas.setPointerCapture(e.pointerId);
    studioState.isDrawing = true;
    const pos = getCanvasPos(e);
    studioState.currentStroke = [pos];
    drawGlyphCanvas();
  });

  glyphCanvas.addEventListener('pointermove', (e) => {
    if (!studioState.isDrawing) return;
    const pos = getCanvasPos(e);
    const last = studioState.currentStroke[studioState.currentStroke.length - 1];
    if (!last || Math.hypot(pos.x - last.x, pos.y - last.y) > 1.5) {
      studioState.currentStroke.push(pos);
      drawGlyphCanvas();
    }
  });

  const finishStroke = () => {
    if (!studioState.isDrawing) return;
    studioState.isDrawing = false;
    if (studioState.currentStroke.length > 0) {
      if (!studioState.glyphs[studioState.currentChar]) {
        studioState.glyphs[studioState.currentChar] = [];
      }
      studioState.glyphs[studioState.currentChar].push(studioState.currentStroke);
      studioState.currentStroke = [];
      drawGlyphCanvas();
      renderCharGrid();
      updateProgressBadge();
      saveStudioToLocalStorage();
    }
  };

  glyphCanvas.addEventListener('pointerup', finishStroke);
  glyphCanvas.addEventListener('pointercancel', finishStroke);
}

function drawWatermarkGlyph(ctx, char, W, topY, baseY, isDescender) {
  if (!char) return;
  ctx.save();
  ctx.setLineDash([]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(100, 116, 139, 0.22)';

  const fontFamily = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Inter", Roboto, sans-serif';
  const baseFontSize = 100;
  ctx.font = `600 ${baseFontSize}px ${fontFamily}`;

  // 1. Ukur bounding box piksel awal dari karakter
  const mInitial = ctx.measureText(char);
  const rawAscent = (mInitial.actualBoundingBoxAscent !== undefined && mInitial.actualBoundingBoxAscent > 0)
    ? mInitial.actualBoundingBoxAscent
    : 68;
  const rawDescent = (mInitial.actualBoundingBoxDescent !== undefined && mInitial.actualBoundingBoxDescent > 0)
    ? mInitial.actualBoundingBoxDescent
    : (isDescender ? 25 : 0);

  // 2. Tentukan batas target yang aman
  // Padding aman: 3px dari Garis Atas dan 1.5px dari Garis Pijakan / Garis Ekor
  const targetTop = topY + 3.0;
  const targetBottom = isDescender ? 286.0 : (baseY - 1.5);
  const targetHeight = Math.max(12, targetBottom - targetTop);

  const glyphTotalHeight = Math.max(10, rawAscent + rawDescent);

  // 3. Hitung skala font agar tinggi karakter pas di dalam targetHeight
  let scale = targetHeight / glyphTotalHeight;

  // Batasi skala untuk simbol kecil agar tidak terlalu membesar
  if (['.', ',', '-', ':', ';', "'", '"'].includes(char)) {
    scale = Math.min(scale, 1.4);
  } else {
    scale = Math.min(scale, 2.4);
  }

  let finalFontSize = Math.max(12, Math.floor(baseFontSize * scale));
  ctx.font = `600 ${finalFontSize}px ${fontFamily}`;

  // 4. Ukur ulang dengan finalFontSize agar mendapatkan nilai rasterisasi presisi nyata
  let mFinal = ctx.measureText(char);
  let actualAscent = (mFinal.actualBoundingBoxAscent !== undefined && mFinal.actualBoundingBoxAscent > 0)
    ? mFinal.actualBoundingBoxAscent
    : (rawAscent * scale);
  let actualDescent = (mFinal.actualBoundingBoxDescent !== undefined && mFinal.actualBoundingBoxDescent > 0)
    ? mFinal.actualBoundingBoxDescent
    : (rawDescent * scale);

  // Jika setelah rasterisasi ternyata masih lebih tinggi dari targetHeight, kecilkan font secara halus
  while ((actualAscent + actualDescent) > targetHeight && finalFontSize > 16) {
    finalFontSize -= 1;
    ctx.font = `600 ${finalFontSize}px ${fontFamily}`;
    mFinal = ctx.measureText(char);
    actualAscent = mFinal.actualBoundingBoxAscent || actualAscent;
    actualDescent = mFinal.actualBoundingBoxDescent || actualDescent;
  }

  // 5. Hitung letak baseline Y dengan jaminan tidak keluar garis
  let finalBaselineY;
  if (isDescender) {
    finalBaselineY = targetBottom - actualDescent;
  } else if (['.', ','].includes(char)) {
    finalBaselineY = baseY - 1.5 - actualDescent;
  } else if (['-', ':', ';', '"', "'"].includes(char)) {
    finalBaselineY = targetTop + actualAscent + (targetHeight - (actualAscent + actualDescent)) / 2;
  } else {
    finalBaselineY = targetBottom - actualDescent;
  }

  // Clamp proteksi absolut: pastikan tidak ada piksel yang melebihi batas atas atau bawah
  if ((finalBaselineY - actualAscent) < (topY + 1.5)) {
    finalBaselineY = topY + 1.5 + actualAscent;
  }
  if ((finalBaselineY + actualDescent) > targetBottom) {
    finalBaselineY = targetBottom - actualDescent;
  }

  // 6. Posisi horizontal: tepat di tengah area kanvas yang aman dari teks label
  const safeCenterX = 130;
  const actualLeft = (mFinal.actualBoundingBoxLeft !== undefined) ? mFinal.actualBoundingBoxLeft : 25;
  const actualRight = (mFinal.actualBoundingBoxRight !== undefined) ? mFinal.actualBoundingBoxRight : 25;
  const finalX = safeCenterX + (actualLeft - actualRight) / 2;

  ctx.fillText(char, finalX, finalBaselineY);
  ctx.restore();
}

function drawGlyphCanvas() {
  if (!gctx) return;
  const W = glyphCanvas.width;
  const H = glyphCanvas.height;

  gctx.clearRect(0, 0, W, H);

  // 1. Bersih & Tajam
  gctx.fillStyle = '#ffffff';
  gctx.fillRect(0, 0, W, H);

  const char = studioState.currentChar;
  const isTall = TALL_CHARS.includes(char);
  const isDescender = DESCENDER_CHARS.includes(char);

  // Tentukan letak Garis Atas:
  // - Huruf Kapital (A-Z, 0-9) & Huruf Bertiang (b, d, h, k, l, t) -> y = 75 (ukuran kapital pada umumnya)
  // - Huruf Kecil biasa & berekor (a, c, e, g, ...) -> y = 125 (ukuran huruf kecil standar)
  const topY = isTall ? 75 : 125;
  const baseY = 240; // Garis Pijakan tumpuan semua huruf

  // 1. ZONA AKTIF HURUF (Arsiran biru lembut antara Garis Atas dan Garis Pijakan)
  gctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
  gctx.fillRect(0, topY, W, baseY - topY);

  // Jika huruf berekor (g, j, p, q, y), arsir juga area ekor ke bawah
  if (isDescender) {
    gctx.fillStyle = 'rgba(255, 241, 242, 0.50)';
    gctx.fillRect(0, baseY, W, 290 - baseY);
  }

  // 2. GARIS ATAS (Batas Atas Tegas)
  gctx.strokeStyle = '#475569';
  gctx.lineWidth = 2.2;
  gctx.setLineDash([7, 4]);
  gctx.beginPath();
  gctx.moveTo(0, topY);
  gctx.lineTo(W, topY);
  gctx.stroke();

  gctx.fillStyle = '#334155';
  gctx.font = 'bold 10px sans-serif';
  gctx.textAlign = 'right';
  gctx.fillText('◄ GARIS ATAS', W - 6, topY - 6);

  // 3. GARIS PIJAKAN (Garis biru tebal solid tempat semua huruf bertumpu)
  gctx.strokeStyle = '#2563eb';
  gctx.lineWidth = 3.0;
  gctx.setLineDash([]);
  gctx.beginPath();
  gctx.moveTo(0, baseY);
  gctx.lineTo(W, baseY);
  gctx.stroke();

  gctx.fillStyle = '#1d4ed8';
  gctx.font = 'bold 10.5px sans-serif';
  gctx.textAlign = 'right';
  gctx.fillText('◄ GARIS PIJAKAN', W - 6, baseY - 6);

  // 4. GARIS EKOR (Hanya muncul khusus untuk huruf berekor: g, j, p, q, y)
  if (isDescender) {
    gctx.strokeStyle = '#e11d48';
    gctx.lineWidth = 1.8;
    gctx.setLineDash([5, 4]);
    gctx.beginPath();
    gctx.moveTo(0, 290);
    gctx.lineTo(W, 290);
    gctx.stroke();

    gctx.fillStyle = '#be123c';
    gctx.font = 'bold 9.5px sans-serif';
    gctx.textAlign = 'right';
    gctx.fillText('◄ GARIS EKOR', W - 6, 286);
  }

  // 4. WATERMARK PRESISI SINKRON 100% (DIJAMIN DI DALAM BATAS GARIS)
  drawWatermarkGlyph(gctx, char, W, topY, baseY, isDescender);

  // 5. GAMBAR CORETAN USER YANG SUDAH TERSIMPAN
  gctx.strokeStyle = '#0f172a';
  gctx.fillStyle = '#0f172a';
  gctx.lineWidth = studioState.penWidth;
  gctx.lineCap = 'round';
  gctx.lineJoin = 'round';

  const strokes = studioState.glyphs[char] || [];
  strokes.forEach(stroke => {
    drawStrokeOnCanvas(gctx, stroke);
  });

  // 6. GAMBAR CORETAN LIVE YANG SEDANG DITARIK
  if (studioState.currentStroke && studioState.currentStroke.length > 0) {
    drawStrokeOnCanvas(gctx, studioState.currentStroke);
  }
}

function drawStrokeOnCanvas(context, stroke) {
  if (stroke.length === 0) return;
  if (stroke.length === 1) {
    context.beginPath();
    context.arc(stroke[0].x, stroke[0].y, studioState.penWidth / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  context.beginPath();
  context.moveTo(stroke[0].x, stroke[0].y);
  for (let i = 1; i < stroke.length; i++) {
    context.lineTo(stroke[i].x, stroke[i].y);
  }
  context.stroke();
}

function undoLastStroke() {
  const strokes = studioState.glyphs[studioState.currentChar];
  if (strokes && strokes.length > 0) {
    strokes.pop();
    drawGlyphCanvas();
    renderCharGrid();
    updateProgressBadge();
    saveStudioToLocalStorage();
  }
}

function clearCurrentGlyph() {
  delete studioState.glyphs[studioState.currentChar];
  drawGlyphCanvas();
  renderCharGrid();
  updateProgressBadge();
  saveStudioToLocalStorage();
}

function strokesToOpentypePath(strokes, penWidth) {
  const path = new opentype.Path();
  if (!strokes || strokes.length === 0) return { path, minX: 0, maxX: 0, advanceWidth: 350 };

  const S = 4.1;
  const radius = (penWidth / 2) * S;

  let overallMinX = Infinity;
  let overallMaxX = -Infinity;

  // 1. Kumpulkan semua titik per coretan dan tentukan batas bounding box horizontal
  const processedStrokes = [];
  strokes.forEach(stroke => {
    if (!stroke || stroke.length === 0) return;
    const pts = [];
    let lastPt = null;
    stroke.forEach(pt => {
      // Filter titik yang terlalu berdekatan (kurang dari 1px) agar tidak redundant
      if (!lastPt || Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) > 1.0) {
        pts.push({
          fx: (pt.x - 40) * S,
          fy: (240 - pt.y) * S
        });
        lastPt = pt;
      }
    });

    // Pastikan titik akhir coretan selalu disertakan
    if (stroke.length > 1) {
      const endPt = stroke[stroke.length - 1];
      if (lastPt !== endPt) {
        pts.push({
          fx: (endPt.x - 40) * S,
          fy: (240 - endPt.y) * S
        });
      }
    }

    if (pts.length > 0) {
      pts.forEach(p => {
        if (p.fx - radius < overallMinX) overallMinX = p.fx - radius;
        if (p.fx + radius > overallMaxX) overallMaxX = p.fx + radius;
      });
      processedStrokes.push(pts);
    }
  });

  if (processedStrokes.length === 0) return { path, minX: 0, maxX: 0, advanceWidth: 350 };

  // 2. Normalisasi posisi horizontal: selaraskan sisi kiri dengan Left Side Bearing (LSB)
  const lsb = 60; // 60 unit font side bearing
  const shiftX = lsb - overallMinX;
  const glyphWidth = overallMaxX - overallMinX;
  const advanceWidth = Math.max(240, Math.round(glyphWidth + lsb * 2));

  // 3. Bangun kurva pita (ribbon contour) dengan ujung membulat (round caps)
  processedStrokes.forEach(pts => {
    // Geser titik horizontal agar huruf berada tepat di LSB
    pts.forEach(p => { p.fx += shiftX; });

    // Coretan titik tunggal (misal titik pada huruf 'i', 'j', tanda titik, dll.)
    if (pts.length === 1) {
      const p = pts[0];
      path.moveTo(p.fx + radius, p.fy);
      for (let a = 1; a < 8; a++) {
        const rad = (a * Math.PI) / 4;
        path.lineTo(p.fx + radius * Math.cos(rad), p.fy + radius * Math.sin(rad));
      }
      path.close();
      return;
    }

    // Hitung vektor normal per segmen
    const normals = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].fx - pts[i].fx;
      const dy = pts[i + 1].fy - pts[i].fy;
      const len = Math.hypot(dx, dy) || 1;
      normals.push({ nx: -dy / len, ny: dx / len });
    }

    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < pts.length; i++) {
      let nx = 0, ny = 0;
      if (i === 0) {
        nx = normals[0].nx;
        ny = normals[0].ny;
      } else if (i === pts.length - 1) {
        nx = normals[normals.length - 1].nx;
        ny = normals[normals.length - 1].ny;
      } else {
        nx = (normals[i - 1].nx + normals[i].nx) / 2;
        ny = (normals[i - 1].ny + normals[i].ny) / 2;
        const l = Math.hypot(nx, ny);
        if (l < 0.2) {
          nx = normals[i - 1].nx;
          ny = normals[i - 1].ny;
        } else {
          nx /= l;
          ny /= l;
        }
      }

      leftSide.push({ x: pts[i].fx + nx * radius, y: pts[i].fy + ny * radius });
      rightSide.push({ x: pts[i].fx - nx * radius, y: pts[i].fy - ny * radius });
    }

    path.moveTo(leftSide[0].x, leftSide[0].y);
    for (let i = 1; i < leftSide.length; i++) {
      path.lineTo(leftSide[i].x, leftSide[i].y);
    }

    // Ujung akhir membulat (round cap)
    const pEnd = pts[pts.length - 1];
    const nEnd = normals[normals.length - 1];
    const nEndAngle = Math.atan2(nEnd.ny, nEnd.nx);
    for (let s = 1; s <= 3; s++) {
      const a = nEndAngle - (s * Math.PI) / 4;
      path.lineTo(pEnd.fx + Math.cos(a) * radius, pEnd.fy + Math.sin(a) * radius);
    }
    path.lineTo(rightSide[rightSide.length - 1].x, rightSide[rightSide.length - 1].y);

    for (let i = rightSide.length - 2; i >= 0; i--) {
      path.lineTo(rightSide[i].x, rightSide[i].y);
    }

    // Ujung awal membulat (round cap)
    const pStart = pts[0];
    const nStart = normals[0];
    const nStartAngle = Math.atan2(-nStart.ny, -nStart.nx);
    for (let s = 1; s <= 3; s++) {
      const a = nStartAngle - (s * Math.PI) / 4;
      path.lineTo(pStart.fx + Math.cos(a) * radius, pStart.fy + Math.sin(a) * radius);
    }
    path.close();
  });

  return {
    path,
    minX: lsb,
    maxX: lsb + glyphWidth,
    advanceWidth
  };
}

async function compileStudioFont(fontFamily) {
  if (!window.opentype) {
    throw new Error('Library opentype.js belum selesai dimuat. Periksa koneksi internet Anda.');
  }

  const useFallback = studioSmartFallbackToggle ? studioSmartFallbackToggle.checked : true;
  const glyphsList = [];
  const seenUnicodes = new Set([0, 32, 160]);

  // 1. .notdef
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, 700);
  notdefPath.lineTo(500, 700);
  notdefPath.lineTo(500, 0);
  notdefPath.close();
  glyphsList.push(new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 650,
    path: notdefPath
  }));

  // 2. Space & Non-breaking space
  glyphsList.push(new opentype.Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: 350,
    path: new opentype.Path()
  }));
  glyphsList.push(new opentype.Glyph({
    name: 'nbspace',
    unicode: 160,
    advanceWidth: 350,
    path: new opentype.Path()
  }));

  // 3. Characters
  const allChars = getAllStudioChars();

  allChars.forEach(char => {
    const code = char.charCodeAt(0);
    if (seenUnicodes.has(code)) return;
    seenUnicodes.add(code);

    if (hasGlyph(char)) {
      const strokes = studioState.glyphs[char];
      const { path, advanceWidth } = strokesToOpentypePath(strokes, studioState.penWidth);

      glyphsList.push(new opentype.Glyph({
        name: char,
        unicode: code,
        advanceWidth: Math.round(advanceWidth),
        path: path
      }));
    } else if (useFallback && studioState.baseTemplateFont) {
      try {
        const baseGlyph = studioState.baseTemplateFont.charToGlyph(char);
        if (baseGlyph && baseGlyph.unicode) {
          glyphsList.push(new opentype.Glyph({
            name: char,
            unicode: code,
            advanceWidth: baseGlyph.advanceWidth,
            path: baseGlyph.path
          }));
        } else {
          glyphsList.push(new opentype.Glyph({
            name: char,
            unicode: code,
            advanceWidth: 400,
            path: new opentype.Path()
          }));
        }
      } catch (e) {
        glyphsList.push(new opentype.Glyph({
          name: char,
          unicode: code,
          advanceWidth: 400,
          path: new opentype.Path()
        }));
      }
    }
  });

  const font = new opentype.Font({
    familyName: fontFamily,
    styleName: 'Regular',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs: glyphsList
  });

  return font.toArrayBuffer();
}

async function handleApplyStudioFont() {
  const baseName = (studioFontNameInput.value.trim() || 'TulisanKu-Font').replace(/\s+/g, '-');
  const uniqueFamily = `${baseName}_${Date.now()}`;
  applyStudioFontBtn.disabled = true;
  applyStudioFontBtn.textContent = 'Mengompilasi Font...';

  try {
    const arrayBuffer = await compileStudioFont(baseName);
    const fontFace = new FontFace(uniqueFamily, arrayBuffer);
    const loadedFont = await fontFace.load();

    // Hapus font kustom sebelumnya dari document.fonts agar tidak terjadi bentrok cache canvas
    Array.from(document.fonts).forEach(f => {
      if (f.family.startsWith(baseName) || f.family.startsWith('CustomHandwrittenFont_')) {
        document.fonts.delete(f);
      }
    });

    document.fonts.add(loadedFont);

    // Save to IndexedDB
    await saveAssetToDB('custom_font', {
      name: `${baseName}.ttf`,
      fontFamily: uniqueFamily,
      isStudioFont: true,
      buffer: arrayBuffer,
      date: Date.now()
    });

    state.font.family = uniqueFamily;
    state.font.isCustom = true;
    state.font.customFontName = `${baseName}.ttf`;

    fontStatusBadge.textContent = 'Font Studio Aktif';
    fontStatusBadge.className = 'text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200';
    savedFontLabel.textContent = `${baseName}.ttf`;
    fontStorageInfo.classList.remove('hidden');

    fontPresetContainer.querySelectorAll('.font-preset-btn').forEach(b => b.classList.remove('active'));

    closeStudio();
    paginateText();
    render();
  } catch (err) {
    alert('Gagal mengompilasi font: ' + err.message);
  } finally {
    applyStudioFontBtn.disabled = false;
    applyStudioFontBtn.innerHTML = '<i class="ph-bold ph-check-circle text-sm"></i> <span>Terapkan ke Kertas</span>';
  }
}

async function handleDownloadTtf() {
  const fontName = (studioFontNameInput.value.trim() || 'TulisanKu-Font').replace(/\s+/g, '-');
  downloadTtfBtn.disabled = true;
  downloadTtfBtn.textContent = 'Membuat file...';

  try {
    const arrayBuffer = await compileStudioFont(fontName);
    const blob = new Blob([arrayBuffer], { type: 'font/ttf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fontName}.ttf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    alert('Gagal mengunduh file font: ' + err.message);
  } finally {
    downloadTtfBtn.disabled = false;
    downloadTtfBtn.innerHTML = '<i class="ph-bold ph-floppy-disk text-sm text-blue-600"></i> <span>Simpan File .TTF</span>';
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

