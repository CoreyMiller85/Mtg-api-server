const { verify } = require("jsonwebtoken");
const Card = require("../models/Card");

const tokenValidation = (req, res, next) => {
	if (!req.header("accessToken")) {
		res.json({ error: "You are not logged in." });
	}
	try {
		const validToken = verify(req.header("accessToken"), "supersecretSquirrel");
		if (validToken) {
			next();
		}
	} catch (err) {
		res.json({ error: err });
	}
};

module.exports = tokenValidation;
