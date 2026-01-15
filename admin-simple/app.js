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
      loadNavigation()
    ]);
  } catch (error) {
    showStatus('Erreur lors du chargement des contenus', 'error');
  }
}

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
  $('#addMainLink').addEventListener('click', () => addLink('mainLinks'));
  $('#addTopLink').addEventListener('click', () => addLink('topLinks'));

  // Support Enter key pour login
  $('#githubToken').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Initialiser les onglets
  initTabs();
});
