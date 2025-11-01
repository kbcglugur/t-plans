// js/firebase.js

// Firebase SDK'larından gerekli fonksiyonları içe aktar
// Not: SDK'lar HTML'den global olarak (compat) yüklendiği için
// 'firebase/app' yerine global 'firebase' nesnesini kullanıyoruz.

// SİZİN 't-plans' PROJENİZİN YAPILANDIRMASI
const firebaseConfig = {
  apiKey: "AIzaSyCBavvfozRwX8agNU9sT12boAU9A2J-6UI",
  authDomain: "t-plans.firebaseapp.com",
  projectId: "t-plans",
  storageBucket: "t-plans.firebasestorage.app",
  messagingSenderId: "202431957522",
  appId: "1:202431957522:web:6922a7bca6e5a51791a6cb",
  measurementId: "G-D1YX50K6H9"
};

// Firebase'i başlat
const app = firebase.initializeApp(firebaseConfig);

// Kullanılacak servisleri al ve ihraç et
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Google Auth Sağlayıcısını ihraç et
export const googleProvider = new firebase.auth.GoogleAuthProvider();
