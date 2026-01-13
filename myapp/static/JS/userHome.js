function readJson(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

let events = readJson("events-data") || [];
let orgs = readJson("orgs-data") || [];
let myApps = readJson("apps-data") || [];

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
const csrftoken = getCookie("csrftoken");

async function apiToggleApplication(eventId, applyNow) {
  const res = await fetch(`/api/applications/${eventId}/`, {
    method: applyNow ? "POST" : "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Eroare la Apply/Cancel");
  return data;
}

function eventCardHTML(evt, { showApplyButton = false, applied = false, disabled = false } = {}) {
  const cap = Number(evt.capacity || 0);
  const used = Number(evt.applicants_count || 0);

  const organizerName = evt.organizer_name || "Unknown";
  const organizerId = evt.organizer_id || "";

  return `
    <li class="event-item">
      <div class="event-title">${evt.title}</div>

      <div class="event-meta">
        📅 ${evt.date} • ⏰ ${evt.time} • 📍 ${evt.location}
      </div>

      <p class="event-desc">${evt.description || ""}</p>

      <div class="event-organizer">
        Organizer:
        <a href="/organizer/${organizerId}/" class="org-link">
          ${organizerName}
        </a>
      </div>

      <div class="event-meta small">
        🏷️ ${evt.category || "—"} • 👥 ${used}/${cap || "—"}
      </div>

      ${
        showApplyButton
          ? `
          <div
            class="apply-btn ${applied ? "cancel" : ""} ${disabled ? "disabled" : ""}"
            data-event-id="${evt.id}"
            data-disabled="${disabled ? "1" : "0"}"
          >
            ${applied ? "Cancel application" : disabled ? "Full" : "Apply"}
          </div>
        `
          : ""
      }
    </li>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.remove("hidden");

      if (tab.dataset.tab === "my") renderMy();
    };
  });
  function renderEvents() {
    const grid = document.getElementById("eventsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    events.forEach((evt) => {
      const applied = myApps.includes(evt.id);

      const cap = Number(evt.capacity || 0);
      const used = Number(evt.applicants_count || 0);
      const isFull = cap > 0 && used >= cap;
      const disabled = isFull && !applied;

      grid.innerHTML += eventCardHTML(evt, {
        showApplyButton: true,
        applied,
        disabled,
      });
    });
    grid.querySelectorAll(".apply-btn").forEach((btn) => {
      btn.onclick = async () => {
        const isDisabled = btn.getAttribute("data-disabled") === "1";
        if (isDisabled) return;

        const eventId = Number(btn.getAttribute("data-event-id"));
        const applied = myApps.includes(eventId);

        try {
          await apiToggleApplication(eventId, !applied);

          if (applied) {
            myApps = myApps.filter((x) => x !== eventId);
            const ev = events.find((e) => e.id === eventId);
            if (ev) ev.applicants_count = Math.max(0, (ev.applicants_count || 0) - 1);
          } else {
            myApps.push(eventId);
            const ev = events.find((e) => e.id === eventId);
            if (ev) ev.applicants_count = (ev.applicants_count || 0) + 1;
          }

          renderEvents();
          renderMy();
        } catch (err) {
          alert(err.message);
        }
      };
    });
  }

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

      box.innerHTML += eventCardHTML(evt, { showApplyButton: false });
    });
  }
  const searchEl = document.getElementById("search");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      const q = (e.target.value || "").toLowerCase().trim();
      const filtered = events.filter(
        (evt) =>
          (evt.title || "").toLowerCase().includes(q) ||
          (evt.category || "").toLowerCase().includes(q) ||
          (evt.location || "").toLowerCase().includes(q) ||
          (evt.organizer_name || "").toLowerCase().includes(q)
      );
      renderSearchResult(filtered);
    });
  }

  function renderSearchResult(data) {
    const box = document.getElementById("result");
    if (!box) return;

    box.innerHTML = "";
    if (!data.length) {
      box.innerHTML = "<li>No events found.</li>";
      return;
    }

    data.forEach((evt) => {
      box.innerHTML += eventCardHTML(evt, { showApplyButton: false });
    });
  }

  const searchOrgEl = document.getElementById("searchOrgInput");
  if (searchOrgEl) {
    searchOrgEl.addEventListener("input", (e) => {
      const q = (e.target.value || "").toLowerCase().trim();
      const filtered = orgs.filter((o) => (o.username || "").toLowerCase().includes(q));
      renderOrg(filtered);
    });
  }

  function renderOrg(data) {
    const box = document.getElementById("list");
    if (!box) return;

    box.innerHTML = "";
    if (!data.length) {
      box.innerHTML = "<li>No organizers found.</li>";
      return;
    }

    data.forEach((o) => {
      const label = o.username || "organizer";
      box.innerHTML += `
        <li class="event-item">
          <a href="/organizer/${o.id}/" class="event-title" style="text-decoration:none;color:inherit;">
            @${label}
          </a>
        </li>
      `;
    });
  }

  renderEvents();
});
