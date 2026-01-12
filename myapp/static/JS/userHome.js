function readJson(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return JSON.parse(el.textContent || "null");
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

let events = readJson("events-data") || [];
let orgs = readJson("orgs-data") || [];
let myApps = readJson("apps-data") || [];

const csrftoken = getCookie("csrftoken");

document.addEventListener("DOMContentLoaded", () => {
  // --- Tab-uri ---
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.remove("hidden");

      if (tab.dataset.tab === "my") renderMy();
    };
  });

  // Search Event
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();

      const filtered = events.filter((evt) =>
        (evt.title || "").toLowerCase().includes(q) ||
        (evt.category || "").toLowerCase().includes(q) ||
        (evt.location || "").toLowerCase().includes(q)
      );

      renderSearchResult(filtered);
    });
  }

  // Search Organizer
  const searchOrgInput = document.getElementById("searchOrg");
  if (searchOrgInput) {
    searchOrgInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();

      const filtered = orgs.filter((o) =>
        (o.username || "").toLowerCase().includes(q)
      );

      renderOrg(filtered);
    });
  }

  renderEvents();
});

// --- Apply / Cancel (SALVEAZĂ ÎN DB) ---
async function toggleApply(eventId) {
  try {
    const isApplied = myApps.includes(eventId);

    const res = await fetch(`/api/applications/${eventId}/`, {
      method: isApplied ? "DELETE" : "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": csrftoken,
      },
    });

    if (!res.ok) {
      throw new Error(`Apply/Cancel failed: ${res.status}`);
    }

    if (isApplied) {
      myApps = myApps.filter((x) => x !== eventId);
    } else {
      myApps.push(eventId);
    }

    renderEvents();
    renderMy();
  } catch (e) {
    alert(e.message);
    console.error(e);
  }
}
window.toggleApply = toggleApply;

// --- Render evenimente ---
function renderEvents() {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  events.forEach((evt) => {
    const applied = myApps.includes(evt.id);

    grid.innerHTML += `
      <li class="event-item">
        <div class="event-title">${evt.title}</div>
        <div class="event-meta">${evt.category}</div>
        <div>📅 ${evt.date} • ⏰ ${evt.time} • 📍 ${evt.location}</div>
        <p>${evt.description || ""}</p>

        <div class="apply-btn ${applied ? "cancel" : ""}"
             onclick="toggleApply(${evt.id})">
          ${applied ? "Cancel application" : "Apply"}
        </div>
      </li>
    `;
  });
}

// --- Render My Applications ---
function renderMy() {
  const box = document.getElementById("myList");
  if (!box) return;

  box.innerHTML = "";

  if (!myApps.length) {
    box.innerHTML = "<li>You are not enrolled in any event.</li>";
    return;
  }

  myApps.forEach((eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    box.innerHTML += `
      <li class="event-item">
        <div class="event-title">${evt.title}</div>
        <div>${evt.date} • ${evt.location}</div>
      </li>
    `;
  });
}

// --- Render Search Event results ---
function renderSearchResult(data) {
  const box = document.getElementById("result");
  if (!box) return;

  box.innerHTML = "";

  data.forEach((evt) => {
    box.innerHTML += `
      <li class="event-item">
        <div class="event-title">${evt.title}</div>
        <div>${evt.date} • ${evt.time} • ${evt.location}</div>
      </li>
    `;
  });
}

// --- Render organizers (CLICKABIL) ---
function renderOrg(data) {
  const box = document.getElementById("list");
  if (!box) return;

  box.innerHTML = "";

  if (!data.length) {
    box.innerHTML = "<li>No organizers found.</li>";
    return;
  }

  data.forEach((o) => {
    // IMPORTANT: link către pagina organizerului
    box.innerHTML += `
      <li class="event-item">
        <a href="/organizer/${o.id}/" class="event-title" style="text-decoration:none; color:inherit;">
          ${o.username}
        </a>
      </li>
    `;
  });
}
