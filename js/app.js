import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyAp4N5Zf6ctmyz64met0Jw8Z7c5Q78PWmA",
  authDomain: "tell-me-d03ef.firebaseapp.com",
  projectId: "tell-me-d03ef",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* MAP INIT */
const map = L.map('map').setView([12.8797,121.7740],6);

/* DARK TILE */
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

/* CLUSTER */
let markers = L.markerClusterGroup();
map.addLayer(markers);

/* 🌍 AUTO ZOOM TO USER LOCATION */
navigator.geolocation.getCurrentPosition(
  (pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 13);

    /* OPTIONAL USER MARKER */
    L.circleMarker([lat, lng], {
      radius:10,
      color:"#22c55e",
      fillColor:"#22c55e",
      fillOpacity:0.8
    })
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  },
  (err)=>{
    console.log("Location denied, default PH view");
  }
);

/* TIME FORMAT */
function formatTime(date){
  const now = new Date();
  const diff = (now - date) / 1000;

  if(diff < 60) return "Just now";
  if(diff < 3600) return Math.floor(diff/60) + " min ago";
  if(diff < 86400) return Math.floor(diff/3600) + " hrs ago";

  return date.toLocaleDateString();
}

/* SELECT LOCATION */
let selectedLocation = null;

map.on('click', function(e){
  selectedLocation = {
    lat: e.latlng.lat,
    lng: e.latlng.lng
  };

  document.getElementById("modal").style.display = "flex";
});

/* CLOSE MODAL */
window.closeModal = function(){
  document.getElementById("modal").style.display = "none";
};

/* POST */
window.submitPost = async function(){

  const text = document.getElementById("thought").value;

  if(text.trim() === ""){
    alert("Write something!");
    return;
  }

  await addDoc(collection(db, "posts"), {
    text: text,
    location: selectedLocation,
    created_at: new Date()
  });

  document.getElementById("thought").value = "";
  closeModal();
};

/* ADD COMMENT */
window.addComment = async function(postId){

  const input = document.getElementById("comment-"+postId);
  const text = input.value;

  if(text.trim() === ""){
    alert("Empty!");
    return;
  }

  await addDoc(collection(db, "posts", postId, "comments"), {
    text: text,
    created_at: new Date()
  });

  input.value = "";
};

/* LOAD POSTS */
onSnapshot(collection(db, "posts"), (snapshot)=>{

  markers.clearLayers();

  snapshot.forEach(postDoc=>{
    const data = postDoc.data();
    const postId = postDoc.id;

    if(data.location){

      const postTime = data.created_at?.seconds
        ? new Date(data.created_at.seconds * 1000)
        : new Date();

      const marker = L.circleMarker(
        [data.location.lat, data.location.lng],
        {
          radius:8,
          color:"#38bdf8",
          fillColor:"#0ea5e9",
          fillOpacity:0.9
        }
      );

      let popupContent = `
        <div class="popup-card">
          <div class="popup-post">💭 ${data.text}</div>
          <div class="popup-time">${formatTime(postTime)}</div>

          <div id="comments-${postId}">Loading...</div>

          <input id="comment-${postId}" class="popup-input" placeholder="Write comment...">
          <button class="popup-btn" onclick="addComment('${postId}')">Reply</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', ()=>{

        const q = query(
          collection(db, "posts", postId, "comments"),
          orderBy("created_at", "desc")
        );

        onSnapshot(q, (snap)=>{

          let html = "";

          snap.forEach(c=>{
            const cdata = c.data();

            const ctime = cdata.created_at?.seconds
              ? new Date(cdata.created_at.seconds * 1000)
              : new Date();

            html += `
              <div class="comment">
                ${cdata.text}
                <div class="comment-time">${formatTime(ctime)}</div>
              </div>
            `;
          });

          document.getElementById("comments-"+postId).innerHTML =
            html || "<small>No comments yet</small>";

        });

      });

      markers.addLayer(marker);
    }
  });

});