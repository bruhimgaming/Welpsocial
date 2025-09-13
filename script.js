// TODO: Replace the config below with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null;
const authDiv = document.getElementById('auth');
const appDiv = document.getElementById('app');
const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const displayNameSpan = document.getElementById('displayName');
const postText = document.getElementById('postText');
const postImage = document.getElementById('postImage');
const postBtn = document.getElementById('postBtn');
const feedDiv = document.getElementById('feed');

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert('Enter email and password');

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
  } catch (error) {
    // Signup if login fails
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
  }

  displayNameSpan.textContent = currentUser.email;
  authDiv.style.display = 'none';
  appDiv.style.display = 'block';
  renderFeed();
});

postBtn.addEventListener('click', async () => {
  const text = postText.value.trim();
  const file = postImage.files[0];
  if (!text && !file) return alert('Write something or select an image');

  let imageUrl = null;
  if (file) {
    const storageRef = storage.ref(`posts-images/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection('posts').add({
    user_id: currentUser.uid,
    text,
    image_url: imageUrl,
    created_at: firebase.firestore.FieldValue.serverTimestamp()
  });

  postText.value = '';
  postImage.value = '';
  renderFeed();
});

async function renderFeed() {
  const snapshot = await db.collection('posts').orderBy('created_at', 'desc').get();
  feedDiv.innerHTML = '';
  snapshot.forEach(doc => {
    const p = doc.data();
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<strong>${p.user_id}</strong><p>${p.text}</p>`;
    if (p.image_url) {
      const img = document.createElement('img');
      img.src = p.image_url;
      div.appendChild(img);
    }
    feedDiv.appendChild(div);
  });
}