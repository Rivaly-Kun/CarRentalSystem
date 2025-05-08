import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk",
  authDomain: "primeroastweb.firebaseapp.com",
  databaseURL: "https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "primeroastweb",
  storageBucket: "primeroastweb.appspot.com",
  messagingSenderId: "157736544071",
  appId: "1:157736544071:web:2713ba60d8edddc5344e62",
  measurementId: "G-MGMCTZCX2G"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const reservationsRef = ref(db, "reservations");
const productsDiv = document.getElementById("productsDiv");
const courtsRef = ref(db, 'courts');


// Fetch and update court availability counts
onValue(courtsRef, (snapshot) => {
    let availableCount = 0;
    let unavailableCount = 0;

    snapshot.forEach((childSnapshot) => {
        const court = childSnapshot.val();
        if (court.status === "Available") {
            availableCount++;
        } else {
            unavailableCount++;
        }
    });

    document.getElementById("Reports").innerText = availableCount;
    document.getElementById("Total_Users").innerText = unavailableCount;
});

// Fetch and count pending reservation requests
onValue(reservationsRef, (snapshot) => {
    let pendingCount = 0;

    snapshot.forEach((childSnapshot) => {
        const reservation = childSnapshot.val();
        if (!reservation.status) {
            pendingCount++;
        }
    });

    document.getElementById("Requests").innerText = pendingCount;
});


onValue(reservationsRef, (snapshot) => {
  const reservations = snapshot.val();
  productsDiv.innerHTML = "";

  let hasLatestUsers = false;

  if (!reservations || Object.keys(reservations).length === 0) {
    productsDiv.innerHTML = `<tr>
  <td colspan="3" style="text-align: center; padding: 20px; font-style: italic; color: gray;">
    No available latest request
  </td>
</tr>
`;
    return;
  }

  let pendingProcessed = 0;

  Object.entries(reservations).forEach(([resId, res]) => {
    if (!res.status || res.status.toLowerCase() !== "accepted") {
      hasLatestUsers = true;
      const userRef = ref(db, `users/${res.userId}`);
      onValue(userRef, (userSnap) => {
        const user = userSnap.val();
        const username = user?.fullName || "Unknown";
        const email = user?.email || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${username}</td>
          <td>${email}</td>
          <td><button data-id="${resId}" class="view-images-btn">View</button></td>
        `;
        productsDiv.appendChild(tr);
      }, { onlyOnce: true });
    }
    pendingProcessed++;
  });

  // If there were no valid users to show
  if (!hasLatestUsers && pendingProcessed === Object.keys(reservations).length) {
    productsDiv.innerHTML = `<tr>
  <td colspan="3" style="text-align: center; padding: 20px; font-style: italic; color: gray;">
    No available latest request
  </td>
</tr>
`;
  }

  productsDiv.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('view-images-btn')) {
      const resId = e.target.getAttribute('data-id');

      showContent('post-content', 'Booking');
      document.getElementById('BreadcrumName').textContent = 'Booking';

      const allSideMenuItems = document.querySelectorAll('#sidebar .side-menu.top li');
      allSideMenuItems.forEach(li => li.classList.remove('active'));

      const postLink = document.getElementById('post-link');
      if (postLink) {
        const li = postLink.closest('li');
        if (li) li.classList.add('active');
      }
    }
  });

  function showContent(contentId, title) {
    contentTitle.textContent = title;

    const contentSections = [
      'dashboard-content',
      'all-members-content',
      'analytics-content',
      'post-content',
      'asstitant-content'
    ];

    contentSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const targetContent = document.getElementById(contentId);
    if (targetContent) targetContent.style.display = 'block';
  }
});

// === Latest Accepted Requests ===
const announcementsDiv = document.getElementById("AnnouncementsDiv");

onValue(reservationsRef, (snapshot) => {
  const reservations = snapshot.val();
  announcementsDiv.innerHTML = "";

  let hasAcceptedUsers = false;

  if (!reservations || Object.keys(reservations).length === 0) {
    announcementsDiv.innerHTML = `<tr>
  <td colspan="2" style="text-align: center; padding: 20px; font-style: italic; color: gray;">
    No latest users
  </td>
</tr>
`;
    return;
  }

  const userIdsShown = new Set();
  let processed = 0;

  Object.entries(reservations).forEach(([resId, res]) => {
    if (res.status && res.status.toLowerCase() === "accepted" && !userIdsShown.has(res.userId)) {
      userIdsShown.add(res.userId);
      hasAcceptedUsers = true;

      const userRef = ref(db, `users/${res.userId}`);
      onValue(userRef, (userSnap) => {
        const user = userSnap.val();
        const username = user?.fullName || "Unknown";
        const email = user?.email || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${username}</td>
          <td>${email}</td>
        `;
        announcementsDiv.appendChild(tr);
      }, { onlyOnce: true });
    }
    processed++;
  });

  if (!hasAcceptedUsers && processed === Object.keys(reservations).length) {
    announcementsDiv.innerHTML = `<tr>
  <td colspan="2" style="text-align: center; padding: 20px; font-style: italic; color: gray;">
    No latest users
  </td>
</tr>
`;
  }
});
