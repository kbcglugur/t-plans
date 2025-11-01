// js/auth.js

// GÜNCELLENDİ: 'googleProvider' firebase.js'den import edildi
import { auth, googleProvider } from './firebase.js';

/**
 * Oturum açma (Sign-in)
 */
export const signIn = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
};

/**
 * Yeni kullanıcı kaydı (Sign-up)
 */
export const signUp = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
};

/**
 * YENİ EKLENDİ: Google ile Giriş Fonksiyonu
 */
export const signInWithGoogle = () => {
    // Popup ile girişi tetikle
    return auth.signInWithPopup(googleProvider);
};

/**
 * Oturumu kapatma (Sign-out)
 */
export const signOut = () => {
    return auth.signOut();
};

/**
 * Kullanıcının oturum durumundaki değişiklikleri dinler.
 * @param {function} callback - Kullanıcı durumu değiştiğinde çağrılır (user veya null)
 */
export const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
};

