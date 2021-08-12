const { Router } = require("express");
const Card = require("../models/Card");
const mongoosePaginate = require("mongoose-paginate-v2");

const router = Router();

const getPagination = (page, size) => {
	const limit = size ? +size : 10;
	const offset = page ? page * limit : 0;

	return { limit, offset };
};

// router.get("/", async (req, res) => {
// 	const { page, size, name } = req.query;
// 	var condition = {};

// 	const { limit, offset } = getPagination(page, size);

// 	Card.paginate(condition, { offset, limit })
// 		.then((data) => {
// 			res.send({
// 				totalItems: data.totalDocs,
// 				cards: data.docs,
// 				totalPages: data.totalPages,
// 				currentPage: data.page - 1,
// 			});
// 		})
// 		.catch((err) => {
// 			res.status(500).send({
// 				message:
// 					err.message || "Some error occurred while retrieving tutorials.",
// 			});
// 		});
// });

router.get("/", async (req, res) => {
	const { page, size, name } = req.query;
	const q = name;
	var condition = name
		? {
				name: { $regex: new RegExp(name), $options: "i" },
				booster: "true",
				promo: "false",
				nonfoil: "true",
		  }
		: {};

	const { limit, offset } = getPagination(page, size);

	Card.paginate(condition, { offset, limit })
		.then((data) => {
			console.log(data);
			res.send({
				totalItems: data.totalDocs,
				cards: data.docs,
				totalPages: data.totalPages,
				currentPage: data.page - 1,
			});
		})
		.catch((err) => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while retrieving tutorials.",
			});
		});

	// let found = await Card.find(
	// 	{
	// 		name: { $regex: new RegExp(req.params.name), $options: "i" },
	// 		booster: true,
	// 	},
	// 	null,
	// 	{ sort: { name: 1 } }
	// ).skip(10);
	// res.send(found);
});

module.exports = router;

// let limit = Math.abs(req.query.limit) || 100;
// 	let page = (Math.abs(req.query.page) || 1) - 1;
// 	const results = await Card.findAll()
// 		.limit(limit)
// 		.skip(limit * page);
// 	console.log(results);
// 	res.send(results);
