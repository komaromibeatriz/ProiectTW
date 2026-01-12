document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", function (e) {
    const usernameInput = registerForm.querySelector('input[name="username"]');
    const emailInput = registerForm.querySelector('input[name="email"]');
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const roleSelect = registerForm.querySelector('select[name="role"]');

    if (!usernameInput || !emailInput || !passwordInput || !roleSelect) {
      return; // nu blocăm dacă lipsește ceva
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    const emailRegex = /^[a-z]+\.[a-z]+[0-9]{0,2}@e-uvt\.ro$/i;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;
    const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;

    if (!role) {
      e.preventDefault();
      alert("Selectează rolul!");
      return;
    }

    if (!usernameRegex.test(username)) {
      e.preventDefault();
      alert("Username invalid. Min 3 caractere. Doar litere/cifre și . _ -");
      return;
    }

    if (!emailRegex.test(email)) {
      e.preventDefault();
      alert("Email invalid (ex: mario.popescu01@e-uvt.ro)");
      return;
    }

    if (!passwordRegex.test(password)) {
      e.preventDefault();
      alert("Parola invalidă (min 7, literă mare+mică, cifră, simbol). Ex: Abcdef1!");
      return;
    }

    // dacă totul e ok -> se trimite la Django normal
  });
});
