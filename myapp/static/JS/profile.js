let nameEl = document.getElementById("profile_name");
let userEl = document.getElementById("profile_username");
let bioEl  = document.getElementById("profile_bio");
let btn    = document.getElementById("editProfileBtn");
const KEY  = "myProfile";

document.addEventListener("DOMContentLoaded", () => {
  if (!nameEl || !userEl || !bioEl || !btn) return;
  const p = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (p.name) nameEl.value = p.name;
  if (p.username) userEl.value = p.username;
  if (p.bio) bioEl.value = p.bio;
  [nameEl, userEl, bioEl].forEach(el => el.readOnly = true);
});

btn?.addEventListener("click", () => {
  if (nameEl.readOnly) {
    [nameEl, userEl, bioEl].forEach(el => el.readOnly = false);
    btn.textContent = "Save profile";
  } else {
    localStorage.setItem(KEY, JSON.stringify({
      name: nameEl.value.trim(),
      username: userEl.value.trim(),
      bio: bioEl.value.trim()
    }));
    [nameEl, userEl, bioEl].forEach(el => el.readOnly = true);
    btn.textContent = "Change profile details";
  }
});
