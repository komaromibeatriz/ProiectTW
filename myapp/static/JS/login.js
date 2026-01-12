document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    const usernameInput = loginForm.querySelector('input[name="username"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');
    const roleSelect = loginForm.querySelector('select[name="role"]');

    if (!usernameInput || !passwordInput || !roleSelect) {
      // dacă lipsește vreun câmp, nu blocăm submit-ul
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;

    if (!usernameRegex.test(username)) {
      e.preventDefault();
      alert("Username invalid. Min 3 caractere. Doar litere/cifre și . _ -");
      return;
    }

    if (!passwordRegex.test(password)) {
      e.preventDefault();
      alert("Parola trebuie să aibă minim 7 caractere și să includă: literă mare, mică, cifră și simbol.");
      return;
    }

    if (!role) {
      e.preventDefault();
      alert("Selectează rolul!");
      return;
    }

    // dacă totul e ok -> NU facem preventDefault -> Django primește POST
  });
});
