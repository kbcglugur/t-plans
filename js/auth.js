// js/auth.js

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
 * Google ile Giriş Fonksiyonu
 */
export const signInWithGoogle = () => {
    // signInWithPopup, sunucu (http/https) gerektirir.
    // Git'ten dağıtıldığında (Hosting) sorunsuz çalışacaktır.
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
