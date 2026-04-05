const bcrypt = require("bcrypt");

const User = require("../models/User");
const { logLoginAttempt, readAuditEntries } = require("../utils/auditLogger");
const {
  isValidEmail,
  getPasswordValidation,
  normalizeLoginInput,
  normalizeSignupInput,
} = require("../utils/validation");

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME_MS = 2 * 60 * 1000;

// Handle new user registration.
async function signup(req, res, next) {
  try {
    const { name, email, password } = normalizeSignupInput(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long.",
      });
    }

    if (!isValidEmail(email)) {
      logLoginAttempt({
        email,
        status: "failed",
        reason: "Invalid email format",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid email address. Please enter a valid email.",
      });
    }

    const passwordValidation = getPasswordValidation(password);

    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Weak password. Please follow the password requirements.",
        errors: passwordValidation.errors,
      });
    }

    // Demo mode fallback when MongoDB is not configured.
    if (!process.env.MONGODB_URI) {
      return res.status(201).json({
        success: true,
        message: "Demo mode active. Use test@gmail.com / Test@123 to log in.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // Never store plain text passwords.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. You can now log in.",
    });
  } catch (error) {
    return next(error);
  }
}

// Handle existing user login.
async function login(req, res, next) {
  try {
    const { email, password } = normalizeLoginInput(req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address. Please enter a valid email.",
      });
    }

    // Demo login should always work for testing.
    if (email === "test@gmail.com" && password === "Test@123") {
      logLoginAttempt({
        email,
        status: "success",
        reason: "Demo login success",
      });

      return res.status(200).json({
        success: true,
        message: "Login successful. Welcome back, Demo User!",
        name: "Demo User",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logLoginAttempt({
        email,
        status: "failed",
        reason: "User not found",
      });

      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Block login for a short time after repeated failed attempts.
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMs = user.lockUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      logLoginAttempt({
        email,
        status: "blocked",
        reason: `Account locked for ${remainingMinutes} more minute(s)`,
      });

      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again after ${remainingMinutes} minute(s).`,
      });
    }

    // Clear expired lock before checking the password.
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.loginAttempts = 0;
        await user.save();

        logLoginAttempt({
          email,
          status: "blocked",
          reason: "Too many failed attempts. Account locked for 2 minutes",
        });

        return res.status(423).json({
          success: false,
          message: "Too many failed attempts. Account locked for 2 minutes.",
        });
      }

      await user.save();

      logLoginAttempt({
        email,
        status: "failed",
        reason: `Wrong password. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt(s) left`,
      });

      return res.status(401).json({
        success: false,
        message: `Wrong password. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt(s) left before lockout.`,
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    logLoginAttempt({
      email,
      status: "success",
      reason: "User login successful",
    });

    return res.status(200).json({
      success: true,
      message: `Login successful. Welcome back, ${user.name}!`,
      name: user.name,
    });
  } catch (error) {
    return next(error);
  }
}

// Return the latest login activity entries for the dashboard.
async function getRecentActivity(req, res, next) {
  try {
    const entries = readAuditEntries()
      .slice(-6)
      .reverse();

    return res.status(200).json({
      success: true,
      entries,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
  getRecentActivity,
};
