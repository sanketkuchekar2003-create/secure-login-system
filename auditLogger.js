const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const AUDIT_FILE = path.join(DATA_DIR, "login-attempts.json");

function ensureAuditFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, "[]", "utf8");
  }
}

function readAuditEntries() {
  ensureAuditFile();

  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function logLoginAttempt({ email, status, reason }) {
  const entries = readAuditEntries();

  entries.push({
    email,
    status,
    reason,
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(AUDIT_FILE, JSON.stringify(entries, null, 2), "utf8");
}

module.exports = {
  logLoginAttempt,
  readAuditEntries,
};
