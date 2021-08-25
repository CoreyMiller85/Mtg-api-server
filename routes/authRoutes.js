const { Router } = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = Router();
const { sign } = require("jsonwebtoken");

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const query = await User.findOne({ email: email });
		if (!query) {
			res.json({
				error: "User Not Found.",
			});
		}
		const match = await bcrypt.compare(password, query.password);
		if (!match) {
			res.json({
				error: "Username or Password Incorrect",
			});
		}
		const accessToken = sign(
			{
				id: query._id,
				username: query.username,
				email: query.email,
			},
			"superseceretsquirell"
		);

		res.json(accessToken);
	} catch (err) {
		res.send("error logging in");
	}
});

// router.get("/signup", async (req, res) => {
// 	res.send("signup GET");
// });

router.post("/signup", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const checkForExsisting = await User.find({ email: email });
		const newUser = await new User({
			name,
			email,
			password,
		});
		const saveUser = await newUser.save();
		res.json(saveUser);
	} catch (error) {
		res.send(error);
	}
});

router.get("/all", async (req, res) => {
	const users = await User.find({});
	res.send(users);
});

module.exports = router;
