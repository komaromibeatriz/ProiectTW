// myapp/static/JS/createEvent.js

const form = document.querySelector(".event-form");
const list = document.getElementById("eventList");

// edit=ID (nu index!)
const editId = new URLSearchParams(window.location.search).get("edit");

// -------------------- CSRF helper --------------------
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

function getCsrfTokenOrThrow() {
  const token = getCookie("csrftoken");
  if (!token) {
    // dacă nu ai csrftoken, de obicei nu ești pe o pagină Django (sau nu ai cookie)
    throw new Error("Lipsește CSRF token. Dă refresh (Ctrl+F5) și încearcă din nou.");
  }
  return token;
}

// -------------------- API calls --------------------
async function apiGetEvents() {
  const res = await fetch("/api/events/", { method: "GET" });
  if (!res.ok) {
    throw new Error("Nu pot încărca evenimentele.");
  }
  const data = await res.json().catch(() => ({}));
  return data.events || [];
}

async function apiCreateEvent(payload) {
  const csrftoken = getCsrfTokenOrThrow();

  const res = await fetch("/api/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Eroare la creare event");
  }
  return await res.json(); // {id: ...}
}

async function apiUpdateEvent(id, payload) {
  const csrftoken = getCsrfTokenOrThrow();

  const res = await fetch(`/api/events/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Eroare la update event");
  }
  return await res.json();
}

async function apiDeleteEvent(id) {
  const csrftoken = getCsrfTokenOrThrow();

  const res = await fetch(`/api/events/${id}/`, {
    method: "DELETE",
    headers: {
      "X-CSRFToken": csrftoken,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Eroare la delete event");
  }
  return await res.json();
}

// -------------------- Form helpers --------------------
function getFormPayload() {
  return {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    location: document.getElementById("location").value.trim(),
    capacity: Number(document.getElementById("capacity").value || 0),
    description: document.getElementById("desc").value.trim(),
  };
}

function fillFormFromEvent(ev) {
  document.getElementById("title").value = ev.title || "";
  document.getElementById("category").value = ev.category || "";
  document.getElementById("date").value = ev.date || "";
  document.getElementById("time").value = ev.time || "";
  document.getElementById("location").value = ev.location || "";
  document.getElementById("capacity").value = ev.capacity ?? "";
  document.getElementById("desc").value = ev.description || "";

  const btn = form?.querySelector(".btn.primary");
  if (btn) btn.textContent = "Save";
}

// -------------------- Render list --------------------
function renderEvents(events) {
  if (!list) return;
  list.innerHTML = "";

  events.forEach((evt) => {
    const li = document.createElement("li");
    li.innerHTML =
      "<div class='event-card'>" +
      `<h3>${evt.title}</h3>` +
      `<span class='category-tag'>${evt.category}</span>` +
      "<p class='event-details'>" +
      ` ${evt.date} | ${evt.time} | ${evt.location}` +
      (evt.capacity ? ` | ${evt.capacity}` : "") +
      "</p>" +
      `<p class='event-desc'>${evt.description || ""}</p>` +
      "<div class='item-actions'>" +
      `<button type="button" class='btn' data-action='edit' data-id='${evt.id}'>Edit</button>` +
      `<button type="button" class='btn ghost' data-action='delete' data-id='${evt.id}'>Delete</button>` +
      "</div>" +
      "</div><hr>";

    list.appendChild(li);
  });
}

// -------------------- Init page --------------------
async function initPage() {
  const events = await apiGetEvents();
  renderEvents(events);

  // dacă e edit=ID, umple formularul
  if (form && editId) {
    const ev = events.find((x) => String(x.id) === String(editId));
    if (ev) fillFormFromEvent(ev);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initPage().catch((e) => alert(e.message));
});

// -------------------- Submit form --------------------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const payload = getFormPayload();

      // validări minime (ca să nu trimiți gol)
      if (!payload.title || !payload.category || !payload.date || !payload.time || !payload.location || !payload.description) {
        alert("Completează toate câmpurile obligatorii.");
        return;
      }

      if (editId) {
        await apiUpdateEvent(editId, payload);
      } else {
        await apiCreateEvent(payload);
      }

      form.reset();
      window.location.href = "organizerAccount.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

// -------------------- Click on list actions --------------------
if (list) {
  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    try {
      if (action === "edit") {
        window.location.href = `createEvent.html?edit=${id}`;
        return;
      }

      if (action === "delete") {
        const ok = confirm("Sigur vrei să ștergi evenimentul?");
        if (!ok) return;

        await apiDeleteEvent(id);
        const events = await apiGetEvents();
        renderEvents(events);
        return;
      }
    } catch (err) {
      alert(err.message);
    }
  });
}
