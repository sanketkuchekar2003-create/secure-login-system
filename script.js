function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password validation used on signup page.
function evaluatePassword(password) {
  const checks = [
    { key: "length", valid: password.length >= 8 },
    { key: "uppercase", valid: /[A-Z]/.test(password) },
    { key: "lowercase", valid: /[a-z]/.test(password) },
    { key: "number", valid: /\d/.test(password) },
    { key: "special", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((item) => item.valid).length;

  return {
    checks,
    score,
    isValid: score === 5,
  };
}

function setMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.className = type ? `form-message ${type}` : "form-message";
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;

  const textElement = button.querySelector(".button-text");
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);

  if (textElement) {
    textElement.textContent = isLoading ? loadingText : defaultText;
  }
}

function updateStrengthUI(password) {
  const strengthMeter = document.getElementById("strengthMeter");
  const strengthText = document.getElementById("strengthText");
  const passwordHint = document.getElementById("passwordHint");
  const validationItems = document.querySelectorAll(".validation-item");

  if (!strengthMeter || !strengthText || !validationItems.length) return;

  const result = evaluatePassword(password);
  let strength = "weak";

  if (result.score === 5) strength = "strong";
  else if (result.score >= 3) strength = "medium";

  strengthMeter.className = `strength-meter ${strength}`;
  strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);

  validationItems.forEach((item) => {
    const matched = result.checks.find((check) => check.key === item.dataset.rule);
    item.className = `validation-item ${matched && matched.valid ? "valid" : "invalid"}`;
  });

  if (passwordHint) {
    if (!password) {
      passwordHint.textContent = "Use a password that meets all 5 requirements.";
      passwordHint.style.color = "";
    } else if (result.isValid) {
      passwordHint.textContent = "Strong password. All requirements are met.";
      passwordHint.style.color = "var(--success)";
    } else {
      passwordHint.textContent = "Password is still weak. Complete all listed rules.";
      passwordHint.style.color = "var(--danger)";
    }
  }
}

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const loginEmailError = document.getElementById("loginEmailError");

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");
const signupButton = document.getElementById("signupButton");
const signupEmailError = document.getElementById("signupEmailError");
const signupPassword = document.getElementById("signupPassword");

// If the user is already marked as logged in, skip the login page.
if (window.location.pathname.endsWith("/login.html") || window.location.pathname === "/") {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    window.location.href = "/dashboard.html";
  }
}

if (signupPassword) {
  updateStrengthUI("");
  signupPassword.addEventListener("input", (event) => {
    updateStrengthUI(event.target.value);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    setMessage(loginMessage, "", "");

    if (!isValidEmail(payload.email || "")) {
      if (loginEmailError) loginEmailError.textContent = "Invalid email format.";
      setMessage(loginMessage, "Please enter a valid email address.", "error");
      return;
    }

    if (loginEmailError) loginEmailError.textContent = "";
    setButtonLoading(loginButton, true, "Checking...", "Login");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // Simple client-side marker so dashboard page can protect itself.
      localStorage.setItem("token", "authenticated");
      localStorage.setItem("userName", data.name || "User");
      setMessage(loginMessage, data.message || "Login successful!", "success");
      window.location.href = "/dashboard.html";
    } catch (error) {
      setMessage(loginMessage, error.message || "Login failed.", "error");
    } finally {
      setButtonLoading(loginButton, false, "Checking...", "Login");
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const payload = Object.fromEntries(formData.entries());
    const passwordCheck = evaluatePassword(payload.password || "");

    setMessage(signupMessage, "", "");

    if (!isValidEmail(payload.email || "")) {
      if (signupEmailError) signupEmailError.textContent = "Invalid email format.";
      setMessage(signupMessage, "Please enter a valid email address.", "error");
      return;
    }

    if (signupEmailError) signupEmailError.textContent = "";

    if (!passwordCheck.isValid) {
      setMessage(signupMessage, "Weak password. Please complete all password rules.", "error");
      return;
    }

    setButtonLoading(signupButton, true, "Creating...", "Create Account");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const extra = data.errors ? ` ${data.errors.join(", ")}` : "";
        throw new Error((data.message || "Signup failed.") + extra);
      }

      setMessage(signupMessage, data.message || "Account created successfully!", "success");
      signupForm.reset();
      updateStrengthUI("");
    } catch (error) {
      setMessage(signupMessage, error.message || "Signup failed.", "error");
    } finally {
      setButtonLoading(signupButton, false, "Creating...", "Create Account");
    }
  });
}
