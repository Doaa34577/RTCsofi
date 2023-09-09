const express = require("express");
const app = express();
const session = require("express-session");
const fs = require("fs");
const mime = require("mime");
const path = require("path");

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form bodies

// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "views/js")));

app.use(
	session({
		secret: "your-secret-key",
		resave: false,
		saveUninitialized: false,
	})
);

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
	if (req.session.user.name) {
		// User is logged in, continue to the next middleware
		next();
	} else {
		// User is not logged in, redirect to login page or display an error
		res.redirect("/");
	}
};

// Define your routes
app.get("/", (req, res) => {
	res.render("index");
});

// Login route - handle form submission
app.post("/login", (req, res) => {
	const { name, password } = req.body;
	console.log("recvide", name, password);
	// Perform authentication logic, validate username and password, etc.
	// For simplicity, we'll use a hardcoded username and password check
	if (name === "user123" && password === "12345") {
		// If authentication is successful, store user information in the session
		req.session.user = { name };
		res.redirect("/todolist");
	} else {
		// If authentication fails, display an error message
		res.render("/", { error: "Invalid username or password" });
	}
});
// Logout route
app.get("/logout", (req, res) => {
	// Clear the user information from the session
	req.session.user = null;
	res.redirect("/");
});

// Protected route
app.get("/todolist", requireLogin, (req, res) => {
	// Render the todolist page
	res.render("todolist", { name: req.session.user.name });
});

// Handle AJAX POST request to save the to-do list
app.post("/webservice", (req, res) => {
	const { items } = req.body;
	if (!items || !Array.isArray(items)) {
		res.status(400).send("Invalid request");
		return;
	}
	const data = { items };
	const jsonData = JSON.stringify(data);
	fs.writeFile("list.json", jsonData, (err) => {
		if (err) {
			res.status(500).send("Error saving to-do list");
			return;
		}
		res.end();
	});
});

// Handle AJAX GET request to retrieve the to-do list
app.get("/webservice", (req, res) => {
	fs.readFile("list.json", "utf8", (err, data) => {
		if (err) {
			if (err.code === "ENOENT") {
				// File does not exist, send an empty response
				res.json([]);
			} else {
				res.status(500).send("Error retrieving to-do list");
			}
			return;
		}
		const listData = JSON.parse(data);
		res.json(listData.items);
	});
});

// Start the server
const port = 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
