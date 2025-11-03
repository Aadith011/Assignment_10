const express = require("express");
const router = express.Router();
const User = require("./models/user");

router.get("/", (req, res) => {
    res.render("signup", { message: null });
});

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.render("signup", { message: "All fields are required." });
        }
        if (name.length < 3) {
            return res.render("signup", { message: "Name must be at least 3 characters." });
        }
        if (password.length < 5) {
            return res.render("signup", { message: "Password must be at least 5 characters." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { message: "Email already registered." });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        // console.log("User saved:", newUser);

        res.render("profile", { user: newUser, message: "Signup successful!" });
    } catch (err) {
        console.error(err);
        res.render("error", { error: err.message });
    }
});

router.get("/login", (req, res) => {
    res.render("login", { message: null });
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("login", { message: "All fields are required." });
        }

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.render("login", { message: "Invalid email or password." });
        }

        res.render("profile", { user });
    } catch (err) {
        console.error(err);
        res.render("error", { error: err.message });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect("/profile");
        }

        res.clearCookie("connect.sid", { path: "/" });
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.redirect("/login");
    });
});

module.exports = router;
