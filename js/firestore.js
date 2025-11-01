// js/firestore.js

import { db } from './firebase.js';

// --- YENİ: KULLANICI YÖNETİMİ ---

/**
 * Bir kullanıcı kaydolduğunda, 'users' koleksiyonunda bir profil belgesi oluşturur.
 * Bu, kullanıcıları e-posta ile arayabilmemiz için gereklidir.
 * @param {string} uid - Firebase Auth UID
 * @param {string} name - Kullanıcının Adı Soyadı
 * @param {string} email - Kullanıcının E-postası
 */
export const createUserProfile = (uid, name, email) => {
    // 'set' ile belge ID'sini UID ile aynı yapıyoruz
    return db.collection('users').doc(uid).set({
        name: name,
        email: email.toLowerCase() // Aramalarda tutarlılık için küçük harf
    });
};

/**
 * E-posta adresine göre bir kullanıcı arar.
 * @param {string} email - Aranacak e-posta
 * @returns {object|null} - Kullanıcı belgesi (veya bulunamazsa null)
 */
export const findUserByEmail = async (email) => {
    const q = db.collection('users').where('email', '==', email.toLowerCase());
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
        return null; // Kullanıcı bulunamadı
    }
    // E-posta benzersiz olduğu için ilk sonucu döndür
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
};

// --- PLAN YÖNETİMİ ---

/**
 * Bir planı, bulunan kullanıcının UID'si ile paylaşır.
 * @param {string} planId - Paylaşılacak planın ID'si
 * @param {string} userIdToShare - Paylaşılacak kullanıcının UID'si
 * @param {string} role - Atanacak rol (örn: 'editor')
 */
export const sharePlanWithUser = (planId, userIdToShare, role = 'editor') => {
    const planRef = db.collection('plans').doc(planId);
    
    // 'update' ile 'members' haritasına yeni bir alan ekliyoruz (dot notation)
    // Örn: members.USER_ID_123 = 'editor'
    return planRef.update({
        [`members.${userIdToShare}`]: role
    });
};


/**
 * Bir kullanıcının erişebildiği planları (sahip olduğu veya paylaşılan)
 * gerçek zamanlı olarak dinler (onSnapshot).
 * @param {string} userId - Mevcut kullanıcının UID'si
 * @param {function} callback - Plan listesi geldiğinde çalışır
 */
export const listenToUserPlans = (userId, callback) => {
    // 'members' alanı, kullanıcının ID'sini içeren planları sorgularız.
    const q = db.collection('plans')
        .where(`members.${userId}`, 'in', ['owner', 'editor', 'viewer', 'approver']);
    
    return q.onSnapshot(querySnapshot => {
        const plans = [];
        querySnapshot.forEach(doc => {
            plans.push({ id: doc.id, ...doc.data() });
        });
        callback(plans);
    });
};

/**
 * Yeni bir plan oluşturur.
 * @param {string} userId - Oluşturan kullanıcının UID'si
 * @param {object} planData - { name: 'Yeni Plan Adı' }
 */
export const createPlan = (userId, planData) => {
    return db.collection('plans').add({
        ...planData,
        ownerId: userId,
        members: {
            [userId]: 'owner' // Sahibi 'owner' rolüyle ekle
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};

// --- GÖREV (TASK) YÖNETİMİ ---

/**
 * Bir plana ait görevleri gerçek zamanlı dinler.
 * @param {string} planId
 * @param {function} callback
 */
export const listenToTasks = (planId, callback) => {
    const q = db.collection('tasks')
        .where('planId', '==', planId)
        .orderBy('order', 'asc'); // Sürükle-bırak için sıralama

    return q.onSnapshot(querySnapshot => {
        const tasks = [];
        querySnapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        callback(tasks);
    });
};

// --- DEĞİŞİKLİK TALEPLERİ (CHANGE REQUESTS) ---

/**
 * Bir plana ait onay bekleyen değişiklik taleplerini dinler.
 * @param {string} planId
 * @param {function} callback
 */
export const listenToChangeRequests = (planId, callback) => {
    const q = db.collection('changeRequests')
        .where('planId', '==', planId)
        .where('status', '==', 'Bekliyor');
    
    return q.onSnapshot(querySnapshot => {
        const requests = [];
        querySnapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        callback(requests);
    });
};

/**
 * Yeni bir değişiklik talebi gönderir (Görev Ekleme, Güncelleme vb.)
 * @param {string} planId
 * @param {string} type - 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK'
 * @param {object} data - İlgili veriler (örn: yeni görev bilgisi)
 * @param {string} userId - Talep eden kullanıcı
 */
export const submitChangeRequest = (planId, type, data, userId) => {
    return db.collection('changeRequests').add({
        planId,
        type,
        data,
        requestedBy: userId,
        status: 'Bekliyor',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};

/**
 * Bir değişiklik talebini onaylar.
 * NOT: Bu işlem ideal olarak bir Firebase Function ile yapılmalıdır
 * ki atomik olarak hem talebi güncellesin hem de asıl işlemi (örn: görevi) yapsın.
 * @param {string} requestId
 */
export const approveChangeRequest = (requestId) => {
    // TODO: Bu işlemi bir Firebase Function'a taşıyın.
    const ref = db.collection('changeRequests').doc(requestId);
    return ref.update({
        status: 'Onaylandı',
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};

