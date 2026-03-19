# 🌌 Unsaid Universe

A location-based anonymous social platform where users can share their thoughts directly on a map and interact through real-time comments.

---

## 🚀 Features

- 🗺️ Interactive map (Leaflet)
- 📍 Click anywhere to post thoughts
- 💬 Real-time comments (thread style)
- 🔥 Live updates using Firebase Firestore
- 🌌 Dark / universe UI design
- 🧠 Anonymous posting (no login required)
- ⏱️ Smart timestamps (Just now, mins ago, date)
- 📊 Clustered markers (grouped posts per area)

---

## 🧠 How It Works

1. User opens the website
2. Map automatically zooms to user's location
3. User clicks any location on the map
4. A modal appears to write a thought
5. Post is saved to Firebase Firestore
6. Marker appears instantly on the map
7. Users can click markers to:
   - View the thought
   - Read comments
   - Add replies in real-time

---

## 📁 Project Structure

```
project/
│
├── index.html
├── README.md
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── include/
│   ├── header.html
│   └── footer.html
│
└── assets/
```

---

## ⚙️ Technologies Used

- HTML, CSS, JavaScript
- Firebase Firestore (Realtime Database)
- Leaflet.js (Map)
- Leaflet MarkerCluster
- Geolocation API

---

## 🔥 Firebase Setup

1. Go to Firebase Console
2. Create a project
3. Enable **Firestore Database**
4. Start in **Test Mode**
5. Go to **Rules** and use:

