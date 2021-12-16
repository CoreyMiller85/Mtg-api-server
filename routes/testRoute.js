const { Router } = require("express");
const Card = require("../models/Card");

const router = Router();
const limit = 10;

router.get("/", async (req, res) => {
	const result = await Card.find({
		name: {
			$regex: new RegExp("^" + "elf" + "|" + "elf" + "$"),
			$options: "i",
		},
	}).sort({ cmc: 1 });
	await res.send(result);
});

router.get("/q", async (req, res) => {
	const count = await Card.find({
		name: {
			$regex: new RegExp("^" + req.query.name + "|" + req.query.name + "$"),
			$options: "i",
		},
	}).countDocuments();

	const result = await Card.find({
		name: {
			$regex: new RegExp("^" + req.query.name + "|" + req.query.name + "$"),
			$options: "i",
		},
	}).sort({ cmc: 1 });

	res.send({
		count: count,
		docs: result,
		limit: 10,
		remaining: Math.ceil(count / limit),
	});
});

module.exports = router;
