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

router.get("/q", async (req, res) => {
	const { page, size, name } = req.query;
	var condition = {};
	if (req.query.name) {
		condition["name"] = {
			$regex: new RegExp(name),
			$options: "i",
		};
	}
	if (req.query.id) {
		condition["_id"] = req.query.id;
	}
	if (req.query.colors) {
		condition["colors"] = req.query.colors.toUpperCase().split("");
	}
	// if (req.query.colors) {
	// 	condition["colors"] = colors.split("");
	// }

	condition.promo = false;
	condition["set_type"] = "expansion";
	condition["booster"] = true;
	console.log(condition);

	// var condition = name
	//  ? {
	//    name: {
	//      $regex: new RegExp(name),
	//      $options: "i",
	//     },

	//     booster: "true",
	//   }
	// 	: {};

	const { limit, offset } = getPagination(page, size);

	Card.paginate(condition, { offset, limit })
		.then((data) => {
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

router.get("/testcards", (req, res) => {
	const page = 1;
	const size = 2;
	const name = "Abbot of Keral Keep";
	var condition = name
		? {
				// name: { $regex: new RegExp(name), $options: "i" },
				// booster: "true",
				// promo: "false",
				// nonfoil: "true",
				// colors: { $all: ["R"] },
				// keywords: "Prowess",
		  }
		: {};

	const { limit, offset } = getPagination(page, size);

	Card.paginate(condition, { offset, limit })
		.then((data) => {
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
});

router.get("/q", async (req, res) => {
	const query = req.query;
	const name = req.query.name;
	const legalities = req.query.legalities;
	const filters = {};
	if (query.name) {
		filters.name = {
			$regex: new RegExp(name),
			$options: "i",
		};
	}
	if (query.legalities) {
		const querySplit = query.legalities.split(",");
		querySplit.map((q) => {
			const queryString = `legalities.${q}`;
			filters[queryString] = "legal";
		});
	}
	if (query.colors) {
		//["W","U","B","R","G"]
		//NOT WORKING CORRECTLY
		thing = query.colors.split("");
		filters.colors = { $all: thing };
	}
	if (query.rarity) {
		// 'common', 'uncommon', 'rare', 'mythic'
		filters.rarity = query.rarity;
	}

	const { limit, offset } = getPagination(req.query.page, req.query.size);

	Card.paginate(filters, { offset, limit })
		.then((data) => {
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
});

module.exports = router;

// let limit = Math.abs(req.query.limit) || 100;
// 	let page = (Math.abs(req.query.page) || 1) - 1;
// 	const results = await Card.findAll()
// 		.limit(limit)
// 		.skip(limit * page);
// 	console.log(results);
// 	res.send(results);
