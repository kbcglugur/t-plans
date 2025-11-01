// js/firebase.js

// SİZİN YAPIŞTIRDIĞINIZ EN GÜNCEL BİLGİLER:
// (Bu blok, sizin sağladığınız en güncel config bilgisidir)
const firebaseConfig = {
  apiKey: "AIzaSyCwA2FfBavvfozJDaghRk12bcQkU9aZv5U",
  authDomain: "t-plans.firebaseapp.com",
  projectId: "t-plans",
  storageBucket: "t-plans.firebasestorage.app",
  messagingSenderId: "202431957522",
  appId: "1:202431957522:web:6932a7bca6e5e51791a6cb",
  measurementId: "G-D11X5QKSH9"
};


// BİZİM UYGULAMAMIZIN KULLANDIĞI YAPI:
// (Biz 'import' değil, index.html'deki global 'firebase' nesnesini kullanıyoruz)

// Firebase'i başlat
const app = firebase.initializeApp(firebaseConfig);
    
// Kullanılacak servisleri al ve ihraç et
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Google Auth Sağlayıcısını ihraç et
export const googleProvider = new firebase.auth.GoogleAuthProvider();

