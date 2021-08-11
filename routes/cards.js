const { Router } = require("express");
const Card = require("../models/Card");
const router = Router();

router.get("/", async (req, res) => {
	let limit = Math.abs(req.query.limit) || 100;
	let page = (Math.abs(req.query.page) || 1) - 1;
	const results = await Card.findAll()
		.limit(limit)
		.skip(limit * page);
	console.log(results);
	res.send(results);

	// const results = await Card.find();
	// console.log(results);
	// res.send(results);
});

router.get("/:name", async (req, res) => {
	let found = await Card.find(
		{
			name: { $regex: new RegExp(req.params.name), $options: "i" },
			booster: true,
		},
		null,
		{ sort: { name: 1 } }
	).skip(10);
	res.send(found);
});

module.exports = router;
