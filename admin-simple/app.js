/**
 * Admin Simple pour Audire
 * Gestion des contenus via l'API GitHub
 */

// Configuration
const CONFIG = {
  owner: 'PlaywithPY',
  repo: 'audire',
  branch: 'main',
  baseUrl: 'https://api.github.com'
};

// État global
let githubToken = null;
let userData = null;

// Utilitaires
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== AUTHENTIFICATION ==========

function loadToken() {
  const token = localStorage.getItem('github_token');
  if (token) {
    githubToken = token;
    return true;
  }
  return false;
}

function saveToken(token) {
  localStorage.setItem('github_token', token);
  githubToken = token;
}

function clearToken() {
  localStorage.removeItem('github_token');
  githubToken = null;
  userData = null;
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${CONFIG.baseUrl}/user`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Token invalide');
    }

    const user = await response.json();
    return user;
  } catch (error) {
    throw new Error('Impossible de vérifier le token');
  }
}

async function handleLogin() {
  const tokenInput = $('#githubToken');
  const token = tokenInput.value.trim();
  const loginBtn = $('#loginBtn');
  const errorDiv = $('#loginError');

  if (!token) {
    showError(errorDiv, 'Veuillez entrer un token GitHub');
    return;
  }

  loginBtn.classList.add('loading');
  errorDiv.classList.add('hidden');

  try {
    const user = await verifyToken(token);
    userData = user;
    saveToken(token);
    showEditor();
    await loadAllContent();
    showStatus('Connecté avec succès !', 'success');
  } catch (error) {
    showError(errorDiv, error.message);
  } finally {
    loginBtn.classList.remove('loading');
  }
}

function handleLogout() {
  clearToken();
  showAuth();
  showStatus('Déconnecté', 'info');
}

function showAuth() {
  $('#authSection').classList.remove('hidden');
  $('#editorSection').classList.add('hidden');
}

function showEditor() {
  $('#authSection').classList.add('hidden');
  $('#editorSection').classList.remove('hidden');
  if (userData) {
    $('#userDisplay').textContent = `👤 ${userData.login}`;
  }
}

// ========== API GITHUB ==========

async function createOrUpdateHTMLFile(path, htmlContent, message) {
  try {
    // Essayer de récupérer le fichier existant
    let sha = null;
    try {
      const response = await fetch(
        `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        sha = data.sha;
      }
    } catch (e) {
      // Fichier n'existe pas, on va le créer
    }

    // Encoder le contenu HTML (pas JSON, juste le HTML brut)
    const encodedContent = btoa(unescape(encodeURIComponent(htmlContent)));

    // Créer ou mettre à jour le fichier
    const body = {
      message: message,
      content: encodedContent,
      branch: CONFIG.branch
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du fichier');
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la création/mise à jour de ${path}:`, error);
    throw error;
  }
}

async function getFile(path) {
  try {
    const response = await fetch(
      `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = atob(data.content);
    return {
      content: JSON.parse(content),
      sha: data.sha
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${path}:`, error);
    throw error;
  }
}

async function updateFile(path, content, message) {
  try {
    // Récupérer le SHA actuel
    const { sha } = await getFile(path);

    // Encoder le contenu
    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    // Mettre à jour le fichier
    const response = await fetch(
      `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          content: encodedContent,
          sha: sha,
          branch: CONFIG.branch
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de ${path}:`, error);
    throw error;
  }
}

// ========== CHARGEMENT DES CONTENUS ==========

async function loadAllContent() {
  try {
    await Promise.all([
      loadContact(),
      loadHomepage(),
      loadNavigation(),
      loadSolutionsAuditives(),
      loadTextesJSON()
    ]);
  } catch (error) {
    showStatus('Erreur lors du chargement des contenus', 'error');
  }
}

let textesData = null;

async function loadContact() {
  try {
    const { content } = await getFile('content/contact.json');
    $('#phoneDisplay').value = content.phoneDisplay || '';
    $('#phoneHref').value = content.phoneHref || '';
    $('#email').value = content.email || '';
    $('#street').value = content.street || '';
    $('#zip').value = content.zip || '';
    $('#city').value = content.city || '';
    $('#province').value = content.province || '';
  } catch (error) {
    console.error('Erreur chargement contact:', error);
  }
}

async function loadHomepage() {
  try {
    const { content } = await getFile('content/pages/homepage.json');
    $('#title').value = content.title || '';
    $('#subtitle').value = content.subtitle || '';
    $('#kicker').value = content.kicker || '';
    $('#chips').value = (content.chips || []).join('\n');
    $('#whatWeDoTitle').value = content.whatWeDo?.title || '';
    $('#whatWeDoDesc').value = content.whatWeDo?.description || '';
  } catch (error) {
    console.error('Erreur chargement homepage:', error);
  }
}

async function loadNavigation() {
  try {
    const { content } = await getFile('content/navigation.json');
    renderLinks('mainLinks', content.mainLinks || []);
    renderLinks('topLinks', content.topLinks || []);
  } catch (error) {
    console.error('Erreur chargement navigation:', error);
  }
}

let solutionsData = null;

async function loadSolutionsAuditives() {
  try {
    const { content } = await getFile('content/solutions-auditives.json');
    solutionsData = content;
    renderSolutions(content.solutions || []);
  } catch (error) {
    console.error('Erreur chargement solutions:', error);
  }
}

async function loadTextesJSON() {
  try {
    const { content } = await getFile('content/textes.json');
    textesData = content;

    // Test Gratuit
    $('#testKicker').value = content['test-auditif-gratuit']?.hero?.kicker || '';
    $('#testTitle').value = content['test-auditif-gratuit']?.hero?.title || '';
    $('#testSubtitle').value = content['test-auditif-gratuit']?.hero?.subtitle || '';

    // Partenaires
    $('#partKicker').value = content['partenaires-pharmaciens']?.hero?.kicker || '';
    $('#partTitle').value = content['partenaires-pharmaciens']?.hero?.title || '';
    $('#partSubtitle').value = content['partenaires-pharmaciens']?.hero?.subtitle || '';

    // FAQ
    $('#faqKicker').value = content['faq']?.hero?.kicker || '';
    $('#faqTitle').value = content['faq']?.hero?.title || '';
    $('#faqSubtitle').value = content['faq']?.hero?.subtitle || '';

    // Remboursements
    $('#remKicker').value = content['remboursements']?.hero?.kicker || '';
    $('#remTitle').value = content['remboursements']?.hero?.title || '';
    $('#remSubtitle').value = content['remboursements']?.hero?.subtitle || '';

    // Accompagnement
    $('#accKicker').value = content['notre-accompagnement']?.hero?.kicker || '';
    $('#accTitle').value = content['notre-accompagnement']?.hero?.title || '';
    $('#accSubtitle').value = content['notre-accompagnement']?.hero?.subtitle || '';

  } catch (error) {
    console.error('Erreur chargement textes.json:', error);
  }
}

function renderSolutions(solutions) {
  const container = $('#solutionsEditor');
  container.innerHTML = '';

  solutions.forEach((sol, index) => {
    const div = document.createElement('div');
    div.className = 'solution-editor-item';
    div.style.cssText = 'margin-bottom: 24px; padding: 20px; border: 2px solid var(--border); border-radius: 8px; background: var(--bg-alt);';

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: var(--text);">${sol.titre || 'Nouvelle solution'}</h3>
        <button class="btn-link" data-remove-solution="${index}" style="color: #ff6b6b;">❌ Supprimer</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>ID (slug URL)</label>
          <input type="text" data-sol="${index}" data-field="id" value="${sol.id || ''}" placeholder="contour-oreille" />
          <small>Sans espaces ni accents (ex: contour-oreille)</small>
        </div>
        <div class="form-group">
          <label>Titre</label>
          <input type="text" data-sol="${index}" data-field="titre" value="${sol.titre || ''}" placeholder="Le contour d'oreille" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Badge (optionnel)</label>
          <input type="text" data-sol="${index}" data-field="badge" value="${sol.badge || ''}" placeholder="Nouveauté" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <select data-sol="${index}" data-field="type">
            <option value="Contour d'oreille" ${sol.type === 'Contour d\'oreille' ? 'selected' : ''}>Contour d'oreille</option>
            <option value="Intra-auriculaire" ${sol.type === 'Intra-auriculaire' ? 'selected' : ''}>Intra-auriculaire</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Image (URL)</label>
        <input type="text" data-sol="${index}" data-field="image" value="${sol.image || ''}" placeholder="/audire/images/solutions/nom.jpg" />
      </div>

      <div class="form-group">
        <label>Description courte</label>
        <textarea data-sol="${index}" data-field="description_courte" rows="2">${sol.description_courte || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Description longue</label>
        <textarea data-sol="${index}" data-field="description_longue" rows="3">${sol.description_longue || ''}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Marques (séparées par virgule)</label>
          <input type="text" data-sol="${index}" data-field="marques" value="${(sol.marques || []).join(', ')}" placeholder="Oticon, Bernafon" />
        </div>
        <div class="form-group">
          <label>Niveaux de perte (séparés par virgule)</label>
          <input type="text" data-sol="${index}" data-field="niveaux_perte" value="${(sol.niveaux_perte || []).join(', ')}" placeholder="Légère, Modérée, Sévère" />
        </div>
      </div>

      <div class="form-group">
        <label>Avantages (un par ligne)</label>
        <textarea data-sol="${index}" data-field="avantages" rows="4">${(sol.avantages || []).join('\n')}</textarea>
      </div>

      <div class="form-group">
        <label>Inconvénients (un par ligne)</label>
        <textarea data-sol="${index}" data-field="inconvenients" rows="3">${(sol.inconvenients || []).join('\n')}</textarea>
      </div>
    `;

    container.appendChild(div);
  });

  // Event listeners pour la suppression
  $$('[data-remove-solution]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-remove-solution'));
      if (confirm('Supprimer cette solution ?')) {
        solutionsData.solutions.splice(index, 1);
        renderSolutions(solutionsData.solutions);
      }
    });
  });
}

// ========== SAUVEGARDE DES CONTENUS ==========

async function saveContact() {
  const btn = $('#saveContact');
  btn.classList.add('loading');

  try {
    const content = {
      phoneDisplay: $('#phoneDisplay').value,
      phoneHref: $('#phoneHref').value,
      email: $('#email').value,
      street: $('#street').value,
      zip: $('#zip').value,
      city: $('#city').value,
      province: $('#province').value
    };

    await updateFile('content/contact.json', content, 'Update contact information via admin');
    showStatus('✅ Informations de contact sauvegardées !', 'success');
  } catch (error) {
    showStatus('❌ Erreur lors de la sauvegarde : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveHomepage() {
  const btn = $('#saveHomepage');
  btn.classList.add('loading');

  try {
    const chipsText = $('#chips').value;
    const chips = chipsText.split('\n').map(c => c.trim()).filter(c => c);

    const content = {
      title: $('#title').value,
      subtitle: $('#subtitle').value,
      kicker: $('#kicker').value,
      chips: chips,
      whatWeDo: {
        title: $('#whatWeDoTitle').value,
        description: $('#whatWeDoDesc').value
      }
    };

    await updateFile('content/pages/homepage.json', content, 'Update homepage content via admin');
    showStatus('✅ Page d\'accueil sauvegardée !', 'success');
  } catch (error) {
    showStatus('❌ Erreur lors de la sauvegarde : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveNavigation() {
  const btn = $('#saveNavigation');
  btn.classList.add('loading');

  try {
    const mainLinks = getLinksFromEditor('mainLinks');
    const topLinks = getLinksFromEditor('topLinks');

    const content = {
      mainLinks,
      topLinks
    };

    await updateFile('content/navigation.json', content, 'Update navigation via admin');
    showStatus('✅ Navigation sauvegardée !', 'success');
  } catch (error) {
    showStatus('❌ Erreur lors de la sauvegarde : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

// ========== GESTION DES LIENS ==========

function renderLinks(type, links) {
  const container = $(`#${type}Editor`);
  container.innerHTML = '';

  links.forEach((link, index) => {
    const item = createLinkItem(type, link, index);
    container.appendChild(item);
  });
}

function createLinkItem(type, link, index) {
  const div = document.createElement('div');
  div.className = 'link-item';
  div.dataset.type = type;
  div.dataset.index = index;

  div.innerHTML = `
    <input type="text" placeholder="Texte" value="${link.text}" data-field="text" />
    <input type="text" placeholder="URL" value="${link.url}" data-field="url" />
    <button class="btn-remove" onclick="removeLink('${type}', ${index})">🗑️ Supprimer</button>
  `;

  return div;
}

function addLink(type) {
  const container = $(`#${type}Editor`);
  const index = container.children.length;
  const newLink = { text: '', url: '' };
  const item = createLinkItem(type, newLink, index);
  container.appendChild(item);
}

function removeLink(type, index) {
  const container = $(`#${type}Editor`);
  const items = Array.from(container.children);
  if (items[index]) {
    items[index].remove();
    // Réindexer
    Array.from(container.children).forEach((item, i) => {
      item.dataset.index = i;
      const removeBtn = item.querySelector('.btn-remove');
      removeBtn.setAttribute('onclick', `removeLink('${type}', ${i})`);
    });
  }
}

function getLinksFromEditor(type) {
  const container = $(`#${type}Editor`);
  const items = Array.from(container.children);

  return items.map(item => {
    const textInput = item.querySelector('[data-field="text"]');
    const urlInput = item.querySelector('[data-field="url"]');
    return {
      text: textInput.value.trim(),
      url: urlInput.value.trim()
    };
  }).filter(link => link.text && link.url);
}

function addSolution() {
  const newSolution = {
    id: '',
    titre: 'Nouvelle solution',
    badge: '',
    image: '/audire/images/solutions/',
    description_courte: '',
    description_longue: '',
    avantages: [],
    inconvenients: [],
    niveaux_perte: ['Légère', 'Modérée'],
    type: 'Contour d\'oreille',
    marques: ['Oticon', 'Bernafon']
  };

  solutionsData.solutions.push(newSolution);
  renderSolutions(solutionsData.solutions);
}

function getSolutionsFromEditor() {
  const solutions = [];
  const inputs = $$('[data-sol]');

  // Grouper par index de solution
  const grouped = {};
  inputs.forEach(input => {
    const solIndex = parseInt(input.getAttribute('data-sol'));
    const field = input.getAttribute('data-field');

    if (!grouped[solIndex]) {
      grouped[solIndex] = {};
    }

    let value = input.value.trim();

    // Traiter les arrays
    if (field === 'marques' || field === 'niveaux_perte') {
      value = value.split(',').map(v => v.trim()).filter(v => v);
    } else if (field === 'avantages' || field === 'inconvenients') {
      value = value.split('\n').map(v => v.trim()).filter(v => v);
    }

    grouped[solIndex][field] = value;
  });

  // Convertir en array
  Object.keys(grouped).sort((a, b) => a - b).forEach(index => {
    solutions.push(grouped[index]);
  });

  return solutions;
}

async function saveSolutionsAuditives() {
  const btn = $('#saveSolutions');
  btn.classList.add('loading');

  try {
    const solutions = getSolutionsFromEditor();

    // Mettre à jour le data
    solutionsData.solutions = solutions;

    // Sauvegarder le JSON
    await updateFile('content/solutions-auditives.json', solutionsData, 'Mise à jour solutions auditives');

    showStatus('✅ Solutions auditives sauvegardées !', 'success');

  } catch (error) {
    showStatus('Erreur lors de la sauvegarde des solutions', 'error');
    console.error(error);
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveTestGratuit() {
  const btn = $('#saveTestGratuit');
  btn.classList.add('loading');

  try {
    textesData['test-auditif-gratuit'].hero.kicker = $('#testKicker').value;
    textesData['test-auditif-gratuit'].hero.title = $('#testTitle').value;
    textesData['test-auditif-gratuit'].hero.subtitle = $('#testSubtitle').value;

    await updateFile('content/textes.json', textesData, 'Mise à jour Test Auditif Gratuit via admin');
    showStatus('✅ Test gratuit sauvegardé !', 'success');
  } catch (error) {
    showStatus('❌ Erreur : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function savePartenaires() {
  const btn = $('#savePartenaires');
  btn.classList.add('loading');

  try {
    textesData['partenaires-pharmaciens'].hero.kicker = $('#partKicker').value;
    textesData['partenaires-pharmaciens'].hero.title = $('#partTitle').value;
    textesData['partenaires-pharmaciens'].hero.subtitle = $('#partSubtitle').value;

    await updateFile('content/textes.json', textesData, 'Mise à jour Partenaires via admin');
    showStatus('✅ Partenaires sauvegardé !', 'success');
  } catch (error) {
    showStatus('❌ Erreur : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveFaq() {
  const btn = $('#saveFaq');
  btn.classList.add('loading');

  try {
    textesData['faq'].hero.kicker = $('#faqKicker').value;
    textesData['faq'].hero.title = $('#faqTitle').value;
    textesData['faq'].hero.subtitle = $('#faqSubtitle').value;

    await updateFile('content/textes.json', textesData, 'Mise à jour FAQ via admin');
    showStatus('✅ FAQ sauvegardée !', 'success');
  } catch (error) {
    showStatus('❌ Erreur : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveRemboursements() {
  const btn = $('#saveRemboursements');
  btn.classList.add('loading');

  try {
    textesData['remboursements'].hero.kicker = $('#remKicker').value;
    textesData['remboursements'].hero.title = $('#remTitle').value;
    textesData['remboursements'].hero.subtitle = $('#remSubtitle').value;

    await updateFile('content/textes.json', textesData, 'Mise à jour Remboursements via admin');
    showStatus('✅ Remboursements sauvegardés !', 'success');
  } catch (error) {
    showStatus('❌ Erreur : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

async function saveAccompagnement() {
  const btn = $('#saveAccompagnement');
  btn.classList.add('loading');

  try {
    textesData['notre-accompagnement'].hero.kicker = $('#accKicker').value;
    textesData['notre-accompagnement'].hero.title = $('#accTitle').value;
    textesData['notre-accompagnement'].hero.subtitle = $('#accSubtitle').value;

    await updateFile('content/textes.json', textesData, 'Mise à jour Accompagnement via admin');
    showStatus('✅ Accompagnement sauvegardé !', 'success');
  } catch (error) {
    showStatus('❌ Erreur : ' + error.message, 'error');
  } finally {
    btn.classList.remove('loading');
  }
}

// ========== GESTION DES IMAGES ==========

function handleImageSelect() {
  const fileInput = $('#imageFile');
  const uploadBtn = $('#uploadImage');
  const preview = $('#imagePreview');
  const previewImg = $('#previewImg');
  const previewInfo = $('#previewInfo');

  const file = fileInput.files[0];
  if (!file) {
    uploadBtn.disabled = true;
    preview.style.display = 'none';
    return;
  }

  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    showStatus('❌ Veuillez sélectionner une image valide', 'error');
    uploadBtn.disabled = true;
    return;
  }

  // Afficher l'aperçu
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    preview.style.display = 'block';
    previewInfo.textContent = `${file.name} - ${(file.size / 1024).toFixed(2)} KB`;
    uploadBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

async function uploadImageToMain() {
  const fileInput = $('#imageFile');
  const pathInput = $('#imagePath');
  const uploadBtn = $('#uploadImage');
  const uploadStatus = $('#uploadStatus');

  const file = fileInput.files[0];
  if (!file) {
    showStatus('❌ Veuillez sélectionner une image', 'error');
    return;
  }

  let targetPath = pathInput.value.trim();
  if (!targetPath.endsWith('/')) {
    targetPath += '/';
  }

  const fileName = file.name;
  const fullPath = targetPath + fileName;

  uploadBtn.classList.add('loading');
  uploadStatus.style.display = 'block';
  uploadStatus.textContent = '⏳ Upload en cours vers la branche main...';
  uploadStatus.style.color = 'var(--text)';

  try {
    // Lire le fichier en base64
    const base64Content = await readFileAsBase64(file);

    // Vérifier si le fichier existe déjà
    let sha = null;
    try {
      const response = await fetch(
        `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${fullPath}?ref=main`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        sha = data.sha;
        uploadStatus.textContent = '⚠️ Fichier existant détecté, remplacement en cours...';
      }
    } catch (e) {
      // Le fichier n'existe pas, c'est OK
    }

    // Créer ou mettre à jour le fichier sur main
    const body = {
      message: `Upload image ${fileName} via admin`,
      content: base64Content,
      branch: 'main'
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${fullPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }

    const imageUrl = `/audire/${fullPath}`;
    uploadStatus.style.color = '#4CAF50';
    uploadStatus.innerHTML = `✅ Image uploadée avec succès !<br>URL: <code>${imageUrl}</code>`;
    showStatus(`✅ Image uploadée sur main: ${imageUrl}`, 'success');

    // Réinitialiser
    fileInput.value = '';
    $('#imagePreview').style.display = 'none';
    uploadBtn.disabled = true;

  } catch (error) {
    uploadStatus.style.color = '#ff6b6b';
    uploadStatus.textContent = `❌ Erreur: ${error.message}`;
    showStatus('❌ Erreur lors de l\'upload: ' + error.message, 'error');
  } finally {
    uploadBtn.classList.remove('loading');
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extraire uniquement la partie base64 (enlever le préfixe data:image/...;base64,)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImagesList() {
  const loadBtn = $('#loadImages');
  const grid = $('#imagesGrid');

  loadBtn.classList.add('loading');
  grid.innerHTML = '<p style="color: var(--text-muted);">Chargement...</p>';

  try {
    const response = await fetch(
      `${CONFIG.baseUrl}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/images?ref=main`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Impossible de charger les images');
    }

    const files = await response.json();
    const imageFiles = files.filter(f =>
      f.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
    );

    if (imageFiles.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted);">Aucune image trouvée</p>';
      return;
    }

    grid.innerHTML = '';
    imageFiles.forEach(file => {
      const card = document.createElement('div');
      card.style.cssText = 'border: 2px solid var(--border); border-radius: 8px; padding: 8px; background: var(--bg-alt);';

      const img = document.createElement('img');
      img.src = file.download_url;
      img.alt = file.name;
      img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;';

      const name = document.createElement('p');
      name.textContent = file.name;
      name.style.cssText = 'margin: 0; font-size: 12px; color: var(--text); word-break: break-all;';

      const url = document.createElement('code');
      url.textContent = `/audire/images/${file.name}`;
      url.style.cssText = 'font-size: 10px; color: var(--text-muted); display: block; margin-top: 4px;';

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(url);
      grid.appendChild(card);
    });

  } catch (error) {
    grid.innerHTML = `<p style="color: #ff6b6b;">Erreur: ${error.message}</p>`;
  } finally {
    loadBtn.classList.remove('loading');
  }
}

// ========== GÉNÉRATION DES PAGES HTML ==========

function generateHTMLPage(solution) {
  const badgeHTML = solution.badge
    ? `<span class="badge">⭐ ${solution.badge}</span>`
    : '';

  const avantagesHTML = solution.avantages
    .map(av => `              <li>${av}</li>`)
    .join('\n');

  const inconvenientsHTML = solution.inconvenients
    .map(inc => `              <li>${inc}</li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO -->
  <title>${solution.titre} - Appareil auditif | Audire</title>
  <meta name="description" content="${solution.description_courte}">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/audire/css/styles.css">
  <style>
    .detail-hero {
      padding: 60px 0;
      background: var(--bg);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      margin-bottom: 40px;
    }
    .detail-content h1 {
      font-size: 36px;
      margin-bottom: 12px;
      color: var(--text);
    }
    .detail-content .badge {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .detail-content p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 16px;
    }
    .detail-image {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius-lg);
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .detail-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
    }

    .pros-cons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 60px;
    }
    .pros-cons-box {
      background: var(--panel);
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      padding: 28px;
    }
    .pros-cons-box h3 {
      font-size: 20px;
      margin-bottom: 16px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pros-cons-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .pros-cons-box li {
      padding: 8px 0;
      display: flex;
      align-items: start;
      gap: 12px;
      color: var(--text-light);
      line-height: 1.6;
    }
    .pros-cons-box.pros {
      border-color: #4CAF50;
    }
    .pros-cons-box.pros h3 {
      color: #4CAF50;
    }
    .pros-cons-box.pros li::before {
      content: '✓';
      color: #4CAF50;
      font-weight: 700;
      font-size: 18px;
    }
    .pros-cons-box.cons {
      border-color: #FF6B6B;
    }
    .pros-cons-box.cons h3 {
      color: #FF6B6B;
    }
    .pros-cons-box.cons li::before {
      content: '✗';
      color: #FF6B6B;
      font-weight: 700;
      font-size: 18px;
    }

    .info-section {
      padding: 60px 0;
      background: var(--bg-alt);
    }
    .info-block {
      max-width: 900px;
      margin: 0 auto;
    }
    .info-block h2 {
      font-size: 28px;
      margin-bottom: 16px;
      color: var(--text);
    }
    .info-block p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 16px;
    }

    .metadata {
      display: flex;
      gap: 24px;
      margin: 24px 0;
      flex-wrap: wrap;
    }
    .metadata-item {
      background: var(--secondary);
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
    }
    .metadata-item strong {
      color: var(--primary);
      display: block;
      margin-bottom: 4px;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .pros-cons {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div id="app-header"></div>

  <!-- Main Content -->
  <main>

    <!-- Hero Section -->
    <section class="detail-hero">
      <div class="container">
        <div class="detail-grid">
          <!-- Content -->
          <div class="detail-content animate-on-scroll">
            ${badgeHTML}
            <h1>${solution.titre}</h1>
            <p>${solution.description_courte}</p>
            <p>${solution.description_longue}</p>

            <div class="metadata">
              <div class="metadata-item">
                <strong>Type</strong>
                ${solution.type}
              </div>
              <div class="metadata-item">
                <strong>Marques</strong>
                ${solution.marques.join(', ')}
              </div>
              <div class="metadata-item">
                <strong>Niveaux de perte</strong>
                ${solution.niveaux_perte.join(', ')}
              </div>
            </div>
          </div>
          <!-- Image -->
          <div class="detail-image animate-on-scroll">
            <img src="${solution.image}" alt="${solution.titre}" onerror="this.style.display='none'">
          </div>
        </div>

        <!-- Pros & Cons -->
        <div class="pros-cons">
          <div class="pros-cons-box pros animate-on-scroll">
            <h3>✓ Points forts</h3>
            <ul>
${avantagesHTML}
            </ul>
          </div>
          <div class="pros-cons-box cons animate-on-scroll">
            <h3>✗ Points faibles</h3>
            <ul>
${inconvenientsHTML}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Info Section -->
    <section class="info-section">
      <div class="container">
        <div class="info-block animate-on-scroll" style="text-align: center;">
          <h2>Découvrez ${solution.titre} chez Audire</h2>
          <p style="margin-bottom: 28px;">
            Venez tester cette solution lors d'une démonstration personnalisée.
          </p>
          <button class="btn btn-primary btn-lg" data-open-modal>
            <span>📅</span>
            <span>Réserver un rendez-vous</span>
          </button>
          <p style="margin-top: 20px; font-size: 14px; color: var(--text-muted);">
            Test gratuit • Sans engagement • Conseils personnalisés
          </p>
        </div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <div id="app-footer"></div>

  <!-- Modal -->
  <div id="app-modal"></div>

  <!-- Scripts -->
  <script src="/audire/js/config.js"></script>
  <script src="/audire/js/design-loader.js"></script>
  <script src="/audire/js/content-loader.js"></script>
  <script src="/audire/js/components.js"></script>
  <script src="/audire/js/main.js"></script>
</body>
</html>
`;
}

async function generateAllPages() {
  const btn = $('#generatePages');
  btn.classList.add('loading');

  try {
    // Recharger les solutions pour être sûr d'avoir les dernières
    const { content } = await getFile('content/solutions-auditives.json');
    const solutions = content.solutions || [];

    if (solutions.length === 0) {
      showStatus('⚠️ Aucune solution à générer', 'info');
      return;
    }

    showStatus(`🚀 Génération de ${solutions.length} page(s) en cours...`, 'info');

    let successCount = 0;
    let errorCount = 0;

    // Générer chaque page
    for (const solution of solutions) {
      try {
        const html = generateHTMLPage(solution);
        const filePath = `solutions-auditives/${solution.id}/index.html`;

        await createOrUpdateHTMLFile(
          filePath,
          html,
          `Génération automatique de la page ${solution.titre}`
        );

        successCount++;
        console.log(`✅ Généré: ${filePath}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${solution.id}:`, error);
      }
    }

    if (errorCount === 0) {
      showStatus(`✅ ${successCount} page(s) générée(s) avec succès !`, 'success');
    } else {
      showStatus(`⚠️ ${successCount} page(s) générée(s), ${errorCount} erreur(s)`, 'info');
    }

  } catch (error) {
    showStatus('❌ Erreur lors de la génération : ' + error.message, 'error');
    console.error(error);
  } finally {
    btn.classList.remove('loading');
  }
}

// ========== GESTION DES ONGLETS ==========

function initTabs() {
  const tabs = $$('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Désactiver tous les onglets
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));

      // Activer l'onglet cliqué
      tab.classList.add('active');
      $(`[data-content="${targetTab}"]`).classList.add('active');
    });
  });
}

// ========== UTILITAIRES UI ==========

function showStatus(message, type = 'info') {
  const status = $('#statusMessage');
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');

  setTimeout(() => {
    status.classList.add('hidden');
  }, 4000);
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

// ========== INITIALISATION ==========

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si un token existe
  if (loadToken()) {
    verifyToken(githubToken)
      .then(user => {
        userData = user;
        showEditor();
        loadAllContent();
      })
      .catch(() => {
        clearToken();
        showAuth();
      });
  } else {
    showAuth();
  }

  // Event listeners
  $('#loginBtn').addEventListener('click', handleLogin);
  $('#logoutBtn').addEventListener('click', handleLogout);
  $('#saveContact').addEventListener('click', saveContact);
  $('#saveHomepage').addEventListener('click', saveHomepage);
  $('#saveNavigation').addEventListener('click', saveNavigation);
  $('#saveSolutions').addEventListener('click', saveSolutionsAuditives);
  $('#generatePages').addEventListener('click', generateAllPages);
  $('#addMainLink').addEventListener('click', () => addLink('mainLinks'));
  $('#addTopLink').addEventListener('click', () => addLink('topLinks'));
  $('#addSolution').addEventListener('click', addSolution);

  // Nouveaux event listeners pour les pages
  $('#saveTestGratuit').addEventListener('click', saveTestGratuit);
  $('#savePartenaires').addEventListener('click', savePartenaires);
  $('#saveFaq').addEventListener('click', saveFaq);
  $('#saveRemboursements').addEventListener('click', saveRemboursements);
  $('#saveAccompagnement').addEventListener('click', saveAccompagnement);

  // Event listeners pour les images
  $('#imageFile').addEventListener('change', handleImageSelect);
  $('#uploadImage').addEventListener('click', uploadImageToMain);
  $('#loadImages').addEventListener('click', loadImagesList);

  // Support Enter key pour login
  $('#githubToken').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Initialiser les onglets
  initTabs();
});
