require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Security middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect to MongoDB
mongoose.connect( {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String, // Store securely with hashing in production!
    fileLink: String,  // Link to the downloadable file
});

const User = mongoose.model("User", UserSchema);

// 📌 API: Register User
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const newUser = new User({
            username,
            password, // In real apps, hash passwords before saving!
            fileLink: "/files/secret.txt",
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// 📌 API: Login User
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ success: true, fileLink: user.fileLink });
    } catch (err) {
        res.status(500).json({ message: "Error during login" });
    }
});

// 📌 API: File Download Route
app.get("/files/:filename", async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "files", filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath); // Triggers file download
    } else {
        res.status(404).json({ message: "File not found" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
