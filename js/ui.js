// js/ui.js

// DOM Elementlerini seç
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const plansList = document.getElementById('plans-list');
const taskTableContainer = document.getElementById('task-table-container');
const requestsList = document.getElementById('requests-list');
const toastContainer = document.getElementById('toast-container');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');

// Giriş/Kayıt form konteynerleri
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');


/**
 * Giriş ekranını göster, uygulama ekranını gizle
 * VE varsayılan olarak giriş formunu göster
 */
export const showLoginScreen = () => {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    
    // Varsayılan olarak giriş formunu göster
    if (loginContainer) loginContainer.classList.remove('hidden');
    if (registerContainer) registerContainer.classList.add('hidden');
};

/**
 * Uygulama ekranını göster, giriş ekranını gizle
 */
export const showAppScreen = () => {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
};

/**
 * Plan listesini arayüzde render eder.
 * @param {Array} plans - Firestore'dan gelen planlar
 */
export const renderPlans = (plans) => {
    plansList.innerHTML = '';
    if (plans.length === 0) {
        plansList.innerHTML = '<p>Henüz planınız yok.</p>';
        return;
    }
    plans.forEach(plan => {
        const div = document.createElement('div');
        div.className = 'plan-item';
        div.innerHTML = `<strong>${plan.name}</strong>`;
        // Tıklama olayı ekle (main.js'te)
        div.dataset.planId = plan.id; 
        div.dataset.planName = plan.name;
        plansList.appendChild(div);
    });
};

/**
 * Görevleri tablo yapısında render eder.
 * @param {Array} tasks - Firestore'dan gelen görevler
 */
export const renderTasks = (tasks) => {
    // Basit bir tablo yapısı
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Görev</th>
                    <th>Durum</th>
                    <th>İlerleme</th>
                </tr>
            </thead>
            <tbody>
    `;
    tasks.forEach(task => {
        html += `
            <tr data-task-id="${task.id}">
                <td>${task.title}</td>
                <td>${task.status}</td>
                <td>${task.progress || 0}%</td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    taskTableContainer.innerHTML = html;
};

/**
 * Değişiklik taleplerini listede render eder.
 * @param {Array} requests
 */
export const renderChangeRequests = (requests) => {
    requestsList.innerHTML = '';
    requests.forEach(req => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Talep: ${req.type} (${req.data.title || ''})</span>
            <button class="btn btn-approve" data-request-id="${req.id}">Onayla</button>
        `;
        requestsList.appendChild(li);
    });
};

/**
 * Ekranda bir "toast" bildirimi gösterir.
 * @param {string} message - Gösterilecek mesaj
 * @param {string} type - 'success', 'error', veya 'warning'
 */
export const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Göster
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Gizle ve kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000); // 3 saniye sonra
};

/**
 * Bir modal pencere açar.
 * @param {string} htmlContent - Modal içinde gösterilecek HTML
 */
export const showModal = (htmlContent) => {
    modalContent.innerHTML = htmlContent;
    modalBackdrop.classList.remove('hidden');
};

/**
 * Modal pencereyi kapatır.
 */
export const hideModal = () => {
    modalBackdrop.classList.add('hidden');
    modalContent.innerHTML = '';
};

// Modal'ı kapatmak için dışarıya (backdrop) tıklamayı dinle
modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
        hideModal();
    }
});

/**
 * Giriş formunu gösterir, kayıt formunu gizler.
 */
export const showLoginForm = () => {
    if (loginContainer) loginContainer.classList.remove('hidden');
    if (registerContainer) registerContainer.classList.add('hidden');
};

/**
 * Kayıt formunu gösterir, giriş formunu gizler.
 */
export const showRegisterForm = () => {
    if (loginContainer) loginContainer.classList.add('hidden');
    if (registerContainer) registerContainer.classList.remove('hidden');
};
