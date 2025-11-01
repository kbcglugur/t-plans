// js/main.js

import { onAuthStateChanged, signIn, signOut, signUp, signInWithGoogle } from './auth.js';
import * as ui from './ui.js';
import * as db from './firestore.js';

// --- Global Durum (State) ---
let currentUser = null;
let currentPlanId = null;
// Aktif dinleyicileri (listeners) tutarak kapatabilmek için
let plansListener = null;
let tasksListener = null;
let requestsListener = null;

// --- OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---

/**
 * Sayfa yüklendiğinde oturum durumunu kontrol et
 */
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            ui.showAppScreen();
            // Kullanıcının planlarını dinlemeye başla
            if (plansListener) plansListener(); // Önceki dinleyiciyi kapat
            plansListener = db.listenToUserPlans(user.uid, ui.renderPlans);
        } else {
            currentUser = null;
            ui.showLoginScreen();
            // Tüm dinleyicileri kapat
            if (plansListener) plansListener();
            if (tasksListener) tasksListener();
            if (requestsListener) requestsListener();
        }
    });
});

/**
 * Giriş Formu
 */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signIn(email, password);
        ui.showToast('Giriş başarılı!', 'success');
    } catch (error) {
        ui.showToast(`Hata: ${error.message}`, 'error');
    }
});

/**
 * Kayıt Formu
 */
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await signUp(email, password);
        ui.showToast('Kayıt başarılı! Hoş geldiniz.', 'success');
    } catch (error) {
        ui.showToast(`Kayıt hatası: ${error.message}`, 'error');
    }
});

/**
 * Google Giriş Butonu Olay Dinleyicisi
 */
document.getElementById('google-signin-btn').addEventListener('click', async () => {
    try {
        await signInWithGoogle();
        ui.showToast('Google ile giriş başarılı!', 'success');
    } catch (error) {
        ui.showToast(`Google giriş hatası: ${error.message}`, 'error');
    }
});


/**
 * Form Değiştirme Linkleri
 */
document.getElementById('show-register-link').addEventListener('click', (e) => {
    e.preventDefault();
    ui.showRegisterForm();
});

document.getElementById('show-login-link').addEventListener('click', (e) => {
    e.preventDefault();
    ui.showLoginForm();
});

/**
 * Çıkış Butonu
 */
document.getElementById('logout-button').addEventListener('click', () => {
    signOut();
    ui.showToast('Çıkış yapıldı.', 'warning');
});

/**
 * Plan Listesinden bir plana tıklandığında
 */
document.getElementById('plans-list').addEventListener('click', (e) => {
    const planItem = e.target.closest('.plan-item');
    if (planItem) {
        currentPlanId = planItem.dataset.planId;
        const planName = planItem.dataset.planName;
        
        // Görevler bölümünü göster
        document.getElementById('tasks-section').classList.remove('hidden');
        document.getElementById('current-plan-name').textContent = planName;

        // Bu plana ait görevleri ve talepleri dinle
        if (tasksListener) tasksListener();
        if (requestsListener) requestsListener();

        tasksListener = db.listenToTasks(currentPlanId, ui.renderTasks);
        requestsListener = db.listenToChangeRequests(currentPlanId, ui.renderChangeRequests);
    }
});

/**
 * "Yeni Görev Talebi" Butonu
 */
document.getElementById('new-task-request-btn').addEventListener('click', () => {
    if (!currentPlanId) return;
    
    // Görev oluşturma formu için modal aç
    const formHtml = `
        <h3>Yeni Görev Talebi</h3>
        <form id="new-task-form">
            <input type="text" id="task-title" placeholder="Görev Başlığı" required>
            <textarea id="task-desc" placeholder="Açıklama"></textarea>
            <button type="submit" class="btn btn-primary">Talep Gönder</button>
        </form>
    `;
    ui.showModal(formHtml);
});

/**
 * "Yeni Plan Oluştur" Butonu
 */
document.getElementById('new-plan-btn').addEventListener('click', () => {
    // Plan oluşturma formu için modal aç
    const formHtml = `
        <h3>Yeni Plan Oluştur</h3>
        <form id="new-plan-form">
            <input type="text" id="plan-name" placeholder="Plan Adı" required>
            <button type="submit" class="btn btn-primary">Oluştur</button>
        </form>
    `;
    ui.showModal(formHtml);
});


/**
 * Modal içindeki formlar (Dinamik olay dinleyicisi)
 */
document.getElementById('modal-backdrop').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Yeni Görev Formu
    if (e.target.id === 'new-task-form') {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        
        const taskData = {
            title,
            description,
            status: 'Başlanmadı',
            progress: 0,
            order: 999 // Varsayılan sıralama (sona ekle)
        };
        
        try {
            await db.submitChangeRequest(currentPlanId, 'CREATE_TASK', taskData, currentUser.uid);
            ui.hideModal();
            ui.showToast('Görev oluşturma talebi gönderildi.', 'success');
        } catch (error) {
            ui.showToast(`Hata: ${error.message}`, 'error');
        }
    }

    // Yeni Plan Formu
    if (e.target.id === 'new-plan-form') {
        const planName = document.getElementById('plan-name').value;
        
        try {
            await db.createPlan(currentUser.uid, { name: planName });
            ui.hideModal();
            ui.showToast('Plan oluşturuldu!', 'success');
        } catch (error) {
            ui.showToast(`Hata: ${error.message}`, 'error');
        }
    }
});

/**
 * Onay Bekleyen Talepler Listesi (Onaylama)
 */
document.getElementById('requests-list').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-approve')) {
        const requestId = e.target.dataset.requestId;
        // TODO: Rol bazlı kontrol (Approver mi?)
        
        try {
            await db.approveChangeRequest(requestId);
            ui.showToast('Talep onaylandı.', 'success');
        } catch (error)
 {
            ui.showToast(`Onaylama hatası: ${error.message}`, 'error');
        }
    }
});
