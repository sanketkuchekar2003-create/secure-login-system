function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSignupInput(body) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
  };
}

function normalizeLoginInput(body) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
  };
}

function getPasswordValidation(password) {
  const checks = [
    {
      key: "length",
      label: "Minimum 8 characters",
      valid: password.length >= 8,
    },
    {
      key: "uppercase",
      label: "At least 1 uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "At least 1 lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "At least 1 number",
      valid: /\d/.test(password),
    },
    {
      key: "special",
      label: "At least 1 special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const errors = checks.filter((item) => !item.valid).map((item) => item.label);
  const score = checks.filter((item) => item.valid).length;

  let strength = "Weak";

  if (score === 5) {
    strength = "Strong";
  } else if (score >= 3) {
    strength = "Medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    checks,
  };
}

module.exports = {
  isValidEmail,
  normalizeSignupInput,
  normalizeLoginInput,
  getPasswordValidation,
};
