const { Router } = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = Router();

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const query = await User.findOne({ email: email });
	const match = await bcrypt.compare(password, query.password);
	res.send(match);
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

router.post("/login", async (req, res) => {
	res.send("login POST");
});

router.get("/all", async (req, res) => {
	const users = await User.find({});
	res.send(users);
});

module.exports = router;
