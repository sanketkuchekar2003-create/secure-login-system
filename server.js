require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Keep MongoDB optional for demo mode.
if (process.env.MONGODB_URI) {
  connectDB();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Fallback error handler to avoid leaking internal details.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
