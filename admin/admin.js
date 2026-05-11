/**
 * INFORMA-TECHNIQUE R — admin.js
 * ─────────────────────────────────────────────────────────
 * Panneau d'administration complet :
 *  - Authentification par mot de passe
 *  - Gestion des vidéos (CRUD + export JSON)
 *  - Notes & Idées (localStorage)
 *  - Planning des tutoriels (localStorage)
 *  - Bandeau d'annonce (localStorage)
 *  - Statistiques
 *  - Liens rapides
 * ─────────────────────────────────────────────────────────
 */

'use strict';

// ── CONFIGURATION ──────────────────────────────────────
const ADMIN_PASSWORD = 'Fortin!t3-2024';
const SESSION_KEY    = 'itr_admin_logged';
// localStorage keys
const LS_NOTES       = 'itr_notes';
const LS_PLANNING    = 'itr_planning';
const LS_ANNONCE     = 'itr_annonce';
// ────────────────────────────────────────────────────────

// Données locales
let localVideos    = [];
let editingId      = null;
let annonceColor   = 'linear-gradient(90deg,#00c8ff,#0066ff)';

/* ══════════════════════════════════════════
   AUTHENTIFICATION
══════════════════════════════════════════ */
function login(e) {
  e.preventDefault();
  const pw  = document.getElementById('adminPassword').value;
  const err = document.getElementById('loginError');

  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    document.getElementById('loginPage').style.display      = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initAdmin();
  } else {
    err.textContent = '❌ Mot de passe incorrect.';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('loginPage').style.display      = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
}

function togglePw() {
  const inp = document.getElementById('adminPassword');
  const btn = document.getElementById('eyeBtn');
  if (inp.type === 'password') {
    inp.type  = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type  = 'password';
    btn.textContent = '👁';
  }
}

/* ══════════════════════════════════════════
   NAVIGATION TABS
══════════════════════════════════════════ */
function showTab(name, el) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  if (el)  el.classList.add('active');

  if (name === 'add' && !editingId) resetForm();
  if (name === 'stats')    renderStats();
  if (name === 'notes')    renderNotes();
  if (name === 'planning') renderPlanning();
  if (name === 'annonces') loadAnnonceForm();
}

/* ══════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════ */
function initAdmin() {
  loadVideos();
  renderStats();
}

/* ══════════════════════════════════════════
   CHARGEMENT DES VIDÉOS
══════════════════════════════════════════ */
async function loadVideos() {
  try {
    const response = await fetch('../data/videos.json?t=' + Date.now());
    if (!response.ok) throw new Error('Fichier introuvable');
    localVideos = await response.json();
    showToast('✅ ' + localVideos.length + ' vidéos chargées', 'success');
  } catch {
    localVideos = [];
    showToast('⚠️ Aucune vidéo dans data/videos.json', 'error');
  }
  renderAdminVideos();
  updateVideoBadge();
  renderStats();
}

function updateVideoBadge() {
  const badge = document.getElementById('videoBadge');
  if (badge) badge.textContent = localVideos.length > 0 ? localVideos.length : '';
}

/* ══════════════════════════════════════════
   RENDU TABLE VIDÉOS
══════════════════════════════════════════ */
function renderAdminVideos() {
  const search    = document.getElementById('adminSearch')?.value.toLowerCase() || '';
  const catFilter = document.getElementById('adminCatFilter')?.value || '';

  let filtered = localVideos.filter(v => {
    const matchSearch = !search
      || v.title.toLowerCase().includes(search)
      || (v.desc || '').toLowerCase().includes(search);
    const matchCat = !catFilter || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const tbody = document.getElementById('adminTableBody');
  const catNames = {
    securite: '🔒 Sécurité', navigateur: '🌐 Navigateur',
    crypto: '💰 Crypto', demarches: '📋 Démarches', astuces: '💡 Astuces'
  };
  const platClass = { youtube: 'yt', facebook: 'fb', tiktok: 'tt' };
  const platNames = { youtube: '📺 YouTube', facebook: '👤 Facebook', tiktok: '🎵 TikTok' };

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-table">Aucune vidéo trouvée</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(v => `
    <tr>
      <td style="color:var(--muted);font-size:12px">#${v.id}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">${v.emoji || '🎯'}</span>
          <span class="video-title-cell" title="${escHTML(v.title)}">${escHTML(v.title)}</span>
        </div>
      </td>
      <td><span class="cat-badge">${catNames[v.category] || v.category}</span></td>
      <td><span class="plat-badge ${platClass[v.platform] || ''}">${platNames[v.platform] || v.platform}</span></td>
      <td style="color:var(--muted);font-size:13px">${v.views || '—'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" onclick="editVideo(${v.id})">✏️ Modifier</button>
          <button class="btn-delete" onclick="deleteVideo(${v.id}, '${escHTML(v.title).slice(0,30)}')">🗑️ Suppr.</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ══════════════════════════════════════════
   MODIFIER UNE VIDÉO
══════════════════════════════════════════ */
function editVideo(id) {
  const v = localVideos.find(x => x.id === id);
  if (!v) return;

  editingId = id;
  document.getElementById('formTitle').textContent = '✏️ Modifier la vidéo';
  document.getElementById('editId').value          = id;
  document.getElementById('vTitle').value          = v.title || '';
  document.getElementById('vCategory').value       = v.category || '';
  document.getElementById('vPlatform').value       = v.platform || '';
  document.getElementById('vEmoji').value          = v.emoji || '';
  document.getElementById('vViews').value          = v.views || '';
  document.getElementById('vDate').value           = v.date || '';
  document.getElementById('vThumbnail').value      = v.thumbnail || '';
  document.getElementById('vDesc').value           = v.desc || '';
  document.getElementById('vTags').value           = (v.tags || []).join(', ');
  document.getElementById('vYoutube').value        = v.links?.youtube  || '';
  document.getElementById('vFacebook').value       = v.links?.facebook || '';
  document.getElementById('vTiktok').value         = v.links?.tiktok   || '';

  showTab('add', document.querySelector('.sidebar-link[onclick*="add"]'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════
   SAUVEGARDER UNE VIDÉO
══════════════════════════════════════════ */
async function saveVideo(e) {
  e.preventDefault();

  const feedback = document.getElementById('formFeedback');
  const saveBtn  = document.getElementById('saveBtn');

  feedback.className    = 'form-feedback';
  feedback.style.display = 'none';
  saveBtn.disabled      = true;
  saveBtn.textContent   = '⏳ Enregistrement...';

  const videoData = {
    title:     document.getElementById('vTitle').value.trim(),
    category:  document.getElementById('vCategory').value,
    platform:  document.getElementById('vPlatform').value,
    emoji:     document.getElementById('vEmoji').value.trim() || '🎯',
    views:     document.getElementById('vViews').value.trim() || '0',
    date:      document.getElementById('vDate').value.trim() || formatDate(),
    thumbnail: document.getElementById('vThumbnail').value.trim(),
    desc:      document.getElementById('vDesc').value.trim(),
    tags:      document.getElementById('vTags').value.split(',').map(t => t.trim()).filter(Boolean),
    links: {
      youtube:  document.getElementById('vYoutube').value.trim(),
      facebook: document.getElementById('vFacebook').value.trim(),
      tiktok:   document.getElementById('vTiktok').value.trim(),
    }
  };

  try {
    if (editingId) {
      const idx = localVideos.findIndex(v => v.id === editingId);
      if (idx !== -1) localVideos[idx] = { ...localVideos[idx], ...videoData };
    } else {
      const maxId = localVideos.length > 0 ? Math.max(...localVideos.map(v => v.id)) : 0;
      localVideos.push({ id: maxId + 1, ...videoData, created_at: new Date().toISOString() });
    }

    renderAdminVideos();
    updateVideoBadge();
    renderStats();

    const msg = editingId ? '✅ Vidéo modifiée !' : '✅ Vidéo ajoutée !';
    feedback.textContent = msg;
    feedback.className = 'form-feedback success';
    feedback.style.display = 'block';
    showToast(msg, 'success');

    exportVideosJSON();

    setTimeout(() => {
      resetForm();
      showTab('videos', document.querySelector('.sidebar-link[onclick*="videos"]'));
    }, 2500);

  } catch (err) {
    feedback.textContent = '❌ ' + err.message;
    feedback.className = 'form-feedback error';
    feedback.style.display = 'block';
    showToast('❌ ' + err.message, 'error');
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = '💾 Enregistrer';
  }
}

/* ══════════════════════════════════════════
   SUPPRIMER UNE VIDÉO
══════════════════════════════════════════ */
async function deleteVideo(id, title) {
  if (!confirm(`⚠️ Supprimer cette vidéo ?\n\n"${title}"\n\nCette action est irréversible.`)) return;

  localVideos = localVideos.filter(v => v.id !== id);
  renderAdminVideos();
  updateVideoBadge();
  renderStats();
  showToast('✅ Vidéo supprimée !', 'success');
  exportVideosJSON();
}

/* ══════════════════════════════════════════
   EXPORT JSON + INSTRUCTIONS GITHUB
══════════════════════════════════════════ */
function exportVideosJSON() {
  const json = JSON.stringify(localVideos, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'videos.json';
  a.click();
  URL.revokeObjectURL(url);
  showUploadBanner();
}

function showUploadBanner() {
  let banner = document.getElementById('uploadBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'uploadBanner';
    banner.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      background:#0d1525; border:2px solid #00c8ff; border-radius:16px;
      padding:20px 28px; max-width:480px; width:90%; z-index:9999;
      box-shadow:0 8px 32px rgba(0,200,255,0.2); color:#e8f0fe;
      font-family:'DM Sans',sans-serif; font-size:14px;
    `;
    document.body.appendChild(banner);
  }
  banner.innerHTML = `
    <div style="font-size:18px;font-weight:700;color:#00c8ff;margin-bottom:10px">
      📥 Fichier téléchargé : videos.json
    </div>
    <div style="color:#8ba3c7;margin-bottom:12px;line-height:1.6">
      Pour mettre à jour le site en ligne, uploade ce fichier sur GitHub :
    </div>
    <ol style="padding-left:18px;line-height:2;color:#e8f0fe">
      <li>Va sur <strong>github.com</strong> → dépôt <strong>hr60-inf.github.io</strong></li>
      <li>Ouvre le dossier <strong>data/</strong></li>
      <li>Clique <strong>"Add file" → "Upload files"</strong></li>
      <li>Uploade <strong>videos.json</strong> → Commit</li>
    </ol>
    <button onclick="document.getElementById('uploadBanner').remove()"
      style="margin-top:14px;padding:8px 20px;background:#00c8ff;color:#000;
      border:none;border-radius:8px;font-weight:700;cursor:pointer;width:100%">
      ✅ Compris !
    </button>
  `;
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '➕ Ajouter une vidéo';
  document.getElementById('videoForm').reset();
  document.getElementById('editId').value = '';
  const fb = document.getElementById('formFeedback');
  fb.className = 'form-feedback';
  fb.style.display = 'none';
}

/* ══════════════════════════════════════════
   NOTES & IDÉES
══════════════════════════════════════════ */
function getNotes() {
  try { return JSON.parse(localStorage.getItem(LS_NOTES)) || []; }
  catch { return []; }
}

function saveNotes(notes) {
  localStorage.setItem(LS_NOTES, JSON.stringify(notes));
}

function addNote() {
  const notes = getNotes();
  const newNote = {
    id:      Date.now(),
    text:    '',
    color:   'default',
    created: new Date().toLocaleDateString('fr-FR')
  };
  notes.unshift(newNote);
  saveNotes(notes);
  renderNotes();
  // focus sur la nouvelle note
  setTimeout(() => {
    const ta = document.querySelector(`[data-note-id="${newNote.id}"] textarea`);
    if (ta) ta.focus();
  }, 50);
}

function updateNote(id, text) {
  const notes = getNotes();
  const idx   = notes.findIndex(n => n.id === id);
  if (idx !== -1) { notes[idx].text = text; saveNotes(notes); }
}

function deleteNote(id) {
  if (!confirm('Supprimer cette note ?')) return;
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes();
}

function setNoteColor(id, color) {
  const notes = getNotes();
  const idx   = notes.findIndex(n => n.id === id);
  if (idx !== -1) { notes[idx].color = color; saveNotes(notes); renderNotes(); }
}

function renderNotes() {
  const container = document.getElementById('notesList');
  if (!container) return;

  const notes = getNotes();
  if (notes.length === 0) {
    container.innerHTML = `<div class="empty-state">📝 Aucune note pour l'instant.<br><small>Cliquez sur "+ Nouvelle note" pour commencer.</small></div>`;
    return;
  }

  const colorMap = {
    default: 'rgba(13,21,37,0.9)',
    blue:    'rgba(0,200,255,0.08)',
    green:   'rgba(0,200,100,0.08)',
    yellow:  'rgba(245,158,11,0.1)',
    red:     'rgba(255,68,68,0.08)',
    purple:  'rgba(124,58,237,0.1)',
  };

  container.innerHTML = notes.map(n => `
    <div class="note-card" data-note-id="${n.id}" style="background:${colorMap[n.color] || colorMap.default}">
      <div class="note-top">
        <span class="note-date">${n.created}</span>
        <div class="note-actions">
          <div class="note-colors">
            ${['default','blue','green','yellow','red','purple'].map(c =>
              `<button onclick="setNoteColor(${n.id},'${c}')" class="nc-dot nc-${c}" title="${c}" ${n.color===c?'style="outline:2px solid #fff"':''}></button>`
            ).join('')}
          </div>
          <button onclick="deleteNote(${n.id})" class="btn-note-del" title="Supprimer">🗑️</button>
        </div>
      </div>
      <textarea
        class="note-textarea"
        placeholder="Écrivez votre idée ici..."
        oninput="updateNote(${n.id}, this.value)"
        onblur="updateNote(${n.id}, this.value)"
      >${escHTML(n.text)}</textarea>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   PLANNING
══════════════════════════════════════════ */
function getPlanning() {
  try { return JSON.parse(localStorage.getItem(LS_PLANNING)) || []; }
  catch { return []; }
}

function savePlanning(items) {
  localStorage.setItem(LS_PLANNING, JSON.stringify(items));
}

function addPlanItem() {
  const title = prompt('Titre du tutoriel à planifier :');
  if (!title || !title.trim()) return;

  const date = prompt('Date prévue (ex: 20/05/2026) :') || '';
  const items = getPlanning();
  items.push({
    id:     Date.now(),
    title:  title.trim(),
    date:   date.trim(),
    done:   false,
    status: 'planifié'
  });
  savePlanning(items);
  renderPlanning();
  showToast('✅ Tutoriel ajouté au planning !', 'success');
}

function togglePlanDone(id) {
  const items = getPlanning();
  const idx   = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx].done   = !items[idx].done;
    items[idx].status = items[idx].done ? 'publié' : 'planifié';
    savePlanning(items);
    renderPlanning();
  }
}

function deletePlanItem(id) {
  if (!confirm('Supprimer cet élément du planning ?')) return;
  savePlanning(getPlanning().filter(i => i.id !== id));
  renderPlanning();
}

function renderPlanning() {
  const container = document.getElementById('planningList');
  if (!container) return;

  const items = getPlanning();
  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">📅 Aucun tutoriel planifié.<br><small>Cliquez sur "+ Ajouter" pour planifier un prochain tutoriel.</small></div>`;
    return;
  }

  // Trier : non-faits d'abord
  const sorted = [...items].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));

  container.innerHTML = sorted.map(item => `
    <div class="plan-item ${item.done ? 'done' : ''}">
      <label class="plan-check">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="togglePlanDone(${item.id})">
        <span class="plan-checkmark"></span>
      </label>
      <div class="plan-info">
        <div class="plan-title">${escHTML(item.title)}</div>
        ${item.date ? `<div class="plan-date">📅 ${escHTML(item.date)}</div>` : ''}
      </div>
      <span class="plan-status ${item.done ? 'ps-done' : 'ps-todo'}">${item.status}</span>
      <button onclick="deletePlanItem(${item.id})" class="btn-note-del" title="Supprimer">🗑️</button>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   ANNONCES
══════════════════════════════════════════ */
function setAnnonceColor(gradient) {
  annonceColor = gradient;
  // Mettre à jour le préview si visible
  const preview = document.getElementById('annoncePreview');
  if (preview && preview.style.display !== 'none') {
    preview.style.background = annonceColor;
  }
  showToast('🎨 Couleur sélectionnée', 'success');
}

function saveAnnonce() {
  const text   = document.getElementById('annonceText').value.trim();
  const link   = document.getElementById('annonceLink').value.trim();
  const active = document.getElementById('annonceActive').checked;

  if (!text) { showToast('⚠️ Entrez un texte pour l\'annonce', 'error'); return; }

  const data = { text, link, active, color: annonceColor };
  localStorage.setItem(LS_ANNONCE, JSON.stringify(data));
  showToast('✅ Annonce enregistrée !', 'success');
}

function previewAnnonce() {
  const text    = document.getElementById('annonceText').value.trim();
  const link    = document.getElementById('annonceLink').value.trim();
  const preview = document.getElementById('annoncePreview');

  if (!text) { showToast('⚠️ Entrez un texte à prévisualiser', 'error'); return; }

  preview.style.background = annonceColor;
  preview.style.display    = 'block';
  preview.innerHTML = link
    ? `${escHTML(text)} <span style="opacity:.7;font-size:12px">→ ${escHTML(link)}</span>`
    : escHTML(text);
}

function loadAnnonceForm() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_ANNONCE));
    if (!data) return;
    document.getElementById('annonceText').value   = data.text || '';
    document.getElementById('annonceLink').value   = data.link || '';
    document.getElementById('annonceActive').checked = !!data.active;
    if (data.color) annonceColor = data.color;
  } catch {}
}

/* ══════════════════════════════════════════
   STATISTIQUES
══════════════════════════════════════════ */
function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  const catProg   = document.getElementById('categoryProgress');
  const platProg  = document.getElementById('platformProgress');
  if (!statsGrid) return;

  const total = localVideos.length;
  const notes   = getNotes().length;
  const planning = getPlanning().filter(i => !i.done).length;

  const catCounts = {
    securite:   localVideos.filter(v => v.category === 'securite').length,
    navigateur: localVideos.filter(v => v.category === 'navigateur').length,
    crypto:     localVideos.filter(v => v.category === 'crypto').length,
    demarches:  localVideos.filter(v => v.category === 'demarches').length,
    astuces:    localVideos.filter(v => v.category === 'astuces').length,
  };

  const platCounts = {
    youtube:  localVideos.filter(v => v.platform === 'youtube').length,
    facebook: localVideos.filter(v => v.platform === 'facebook').length,
    tiktok:   localVideos.filter(v => v.platform === 'tiktok').length,
  };

  statsGrid.innerHTML = `
    <div class="stat-card sc-blue">
      <div class="stat-icon">🎬</div>
      <div class="stat-num">${total}</div>
      <div class="stat-label">Tutoriels total</div>
    </div>
    <div class="stat-card sc-green">
      <div class="stat-icon">▶️</div>
      <div class="stat-num">${platCounts.youtube}</div>
      <div class="stat-label">YouTube</div>
    </div>
    <div class="stat-card sc-fb">
      <div class="stat-icon">📘</div>
      <div class="stat-num">${platCounts.facebook}</div>
      <div class="stat-label">Facebook</div>
    </div>
    <div class="stat-card sc-tt">
      <div class="stat-icon">🎵</div>
      <div class="stat-num">${platCounts.tiktok}</div>
      <div class="stat-label">TikTok</div>
    </div>
    <div class="stat-card sc-yellow">
      <div class="stat-icon">📝</div>
      <div class="stat-num">${notes}</div>
      <div class="stat-label">Notes enregistrées</div>
    </div>
    <div class="stat-card sc-purple">
      <div class="stat-icon">📅</div>
      <div class="stat-num">${planning}</div>
      <div class="stat-label">Tutoriels à publier</div>
    </div>
  `;

  const catItems = [
    ['🔒 Sécurité',   catCounts.securite],
    ['🌐 Navigateur', catCounts.navigateur],
    ['💰 Crypto',     catCounts.crypto],
    ['📋 Démarches',  catCounts.demarches],
    ['💡 Astuces',    catCounts.astuces],
  ];

  if (catProg) {
    catProg.innerHTML = catItems.map(([label, count]) => `
      <div class="progress-item">
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${total > 0 ? (count/total*100).toFixed(1) : 0}%"></div>
        </div>
        <div class="progress-count">${count}</div>
      </div>
    `).join('');
  }

  const platItems = [
    ['▶️ YouTube',  platCounts.youtube],
    ['📘 Facebook', platCounts.facebook],
    ['🎵 TikTok',  platCounts.tiktok],
  ];

  if (platProg) {
    platProg.innerHTML = platItems.map(([label, count]) => `
      <div class="progress-item">
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${total > 0 ? (count/total*100).toFixed(1) : 0}%"></div>
        </div>
        <div class="progress-count">${count}</div>
      </div>
    `).join('');
  }
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = '') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className   = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
function escHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

/* ══════════════════════════════════════════
   INIT AU CHARGEMENT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    document.getElementById('loginPage').style.display      = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initAdmin();
  }

  const pwField = document.getElementById('adminPassword');
  if (pwField) pwField.focus();
});
