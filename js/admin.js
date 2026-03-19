import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyAp4N5Zf6ctmyz64met0Jw8Z7c5Q78PWmA",
  authDomain: "tell-me-d03ef.firebaseapp.com",
  projectId: "tell-me-d03ef",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* LOGIN */
window.login = function(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const error = document.getElementById("error");
  error.innerText = "Logging in...";

  signInWithEmailAndPassword(auth, email, password)
    .then(()=>{
      error.innerText = "";
    })
    .catch(err=>{
      error.innerText = "❌ " + err.message;
    });
};

/* CHECK AUTH */
onAuthStateChanged(auth, (user)=>{

  if(user && user.email === "admin@unsaid.com"){
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    loadPosts();
  } else {
    document.getElementById("loginBox").style.display = "flex";
  }

});

/* TIME FORMAT */
function formatTime(date){
  const now = new Date();
  const diff = (now - date)/1000;

  if(diff < 60) return "Just now";
  if(diff < 3600) return Math.floor(diff/60)+" min ago";
  if(diff < 86400) return Math.floor(diff/3600)+" hrs ago";

  return date.toLocaleDateString();
}

/* DELETE */
window.deletePost = async function(id){
  if(!confirm("Delete this post?")) return;
  await deleteDoc(doc(db, "posts", id));
};

/* TOGGLE COMMENTS */
window.toggleComments = async function(postId){

  const container = document.getElementById("comments-"+postId);

  /* toggle */
  if(container.style.display === "block"){
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = "Loading...";

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("created_at","desc")
  );

  onSnapshot(q, (snap)=>{

    let html = "";

    snap.forEach(c=>{
      const data = c.data();

      const time = data.created_at?.seconds
        ? new Date(data.created_at.seconds * 1000)
        : new Date();

      html += `
        <div style="
          background:#1e293b;
          padding:8px;
          border-radius:8px;
          margin-top:5px;
        ">
          ${data.text}
          <div style="font-size:10px;color:#aaa;">
            ${formatTime(time)}
          </div>
        </div>
      `;
    });

    container.innerHTML = html || "No comments yet";

  });
};

/* LOAD POSTS */
function loadPosts(){

  const q = query(collection(db, "posts"), orderBy("created_at","desc"));

  onSnapshot(q, async (snapshot)=>{

    let html = "";

    for(const postDoc of snapshot.docs){

      const data = postDoc.data();
      const postId = postDoc.id;

      const time = data.created_at?.seconds
        ? new Date(data.created_at.seconds * 1000)
        : new Date();

      const commentsSnap = await getDocs(collection(db,"posts",postId,"comments"));

      html += `
        <div style="
          background:#111827;
          padding:15px;
          border-radius:12px;
          margin-bottom:10px;
        ">
          <b>💭 ${data.text}</b><br>

          <small>
            🕒 ${formatTime(time)} <br>
            📍 ${data.location?.lat}, ${data.location?.lng}
          </small><br><br>

          <button onclick="toggleComments('${postId}')">
            💬 ${commentsSnap.size} Comments
          </button>

          <div id="comments-${postId}" style="display:none;margin-top:10px;"></div>

          <button onclick="deletePost('${postId}')" style="
            margin-top:10px;
            background:#ef4444;
            padding:5px;
            border:none;
            color:white;
            border-radius:6px;
          ">
            Delete
          </button>
        </div>
      `;
    }

    document.getElementById("posts").innerHTML = html;

  });

}