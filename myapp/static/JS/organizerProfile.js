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

async function toggleApply(eventId, btn) {
  const applied = btn.dataset.applied === "1";
  const full = btn.dataset.full === "1";

  if (full && !applied) {
    alert("Event is full.");
    return;
  }

  const method = applied ? "DELETE" : "POST";

  const res = await fetch(`/api/applications/${eventId}/`, {
    method,
    headers: {
      "X-CSRFToken": csrftoken,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(data.error || "Eroare la apply/cancel.");
    return;
  }

  btn.dataset.applied = data.applied ? "1" : "0";
  btn.dataset.full = data.full ? "1" : "0";

  btn.textContent = data.applied ? "Cancel application" : "Apply";
  btn.classList.toggle("cancel", !!data.applied);

  const countEl = document.getElementById(`count-${eventId}`);
  if (countEl && typeof data.app_count !== "undefined") {
    countEl.textContent = data.app_count;
  }

  const fullMsg = document.getElementById(`fullmsg-${eventId}`);
  if (fullMsg) {
    if (data.full && !data.applied) fullMsg.classList.remove("hidden");
    else fullMsg.classList.add("hidden");
  }

  btn.disabled = (data.full && !data.applied);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".apply-action").forEach((btn) => {
    const eventId = btn.dataset.eventId;

    const applied = btn.dataset.applied === "1";
    const full = btn.dataset.full === "1";
    btn.disabled = (full && !applied);

    btn.addEventListener("click", () => toggleApply(eventId, btn));
  });
});
