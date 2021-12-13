const { Router } = require("express");
const Card = require("../models/Card");

const router = Router();

const getPagination = (page, size) => {
	const limit = size ? +size : 10;
	const offset = page ? page * limit : 0;
	return { limit, offset };
};

// TESTING FOR NEW ALGO for search field.
router.get("/test", async (req, res) => {
	const limit = req.query.limit || 10;
	const page = req.query.page || 1;
	const offset = limit * (page - 1);

	/* START OF TEST CODE */
	var condition = {};
	if (req.query.name) {
		condition["name"] = {
			$regex: new RegExp("^" + req.query.name + "|" + req.query.name + "$"),
			$options: "i",
		};
	}
	if (req.query.id) {
		condition["id"] = req.query.id;
	}
	if (req.query.colors) {
		// BGRUW is the color order.
		colorsList = req.query.colors.toUpperCase().split("");
		condition.colors = { $all: colorsList };
	}
	if (req.query.legalities) {
		const querySplit = req.query.legalities.split(",");
		querySplit.map((q) => {
			const queryString = `legalities.${q}`;
			condition[queryString] = "legal";
		});
	}
	if (req.query.rarity) {
		condition["rarity"] = req.query.rarity;
	}

	const cardFilters = {
		set_type: { $in: ["expansion", "masters", "core"] },
		promo: false,
		booster: true,
	};

	// Combines condition with filters for cleaner code
	condition = { ...condition, ...cardFilters };

	const options = {
		sort: {
			name: 1,
			cmc: 1,
		},
		select: {
			name: 1,
			image_uris: {
				normal: 1,
			},
			colors: 1,
			mana_cost: 1,
			rarity: 1,
			legalities: 1,
		},
	};
	/* END OF TEST CODE */

	const count = await Card.find(condition).countDocuments();

	const result = await Card.find(condition)
		.skip(offset)
		.sort({ cmc: 1 })
		.limit(limit)
		.select(options.select);

	res.send({
		condition,
		count: count,
		limit: limit,
		offset,
		hasNext: offset + limit <= count,
		docs: result,
	});
});

router.get("/w", async (req, res) => {
	const { name } = req.query;
	const condition = {};
	if (name) {
		condition["name"] = {
			$regex: new RegExp("^" + name),
			$options: "i",
		};
	}
	console.log(condition);
	const result = await Card.find(condition).select({ name: 1 });
	res.send(result);
});

// router.get("/q", async (req, res) => {
// 	const { page, size, name } = req.query;
// 	var condition = {};
// 	if (req.query.name) {
// 		condition["name"] = {
// 			$regex: new RegExp(name),
// 			$options: "i",
// 		};
// 	}
// 	if (req.query.id) {
// 		condition["_id"] = req.query.id;
// 	}
// 	if (req.query.colors) {
// 		// BGRUW is the color order.
// 		colorsList = req.query.colors.toUpperCase().split(",");
// 		condition.colors = { $all: colorsList };
// 	}
// 	if (req.query.legalities) {
// 		const querySplit = req.query.legalities.split(",");
// 		querySplit.map((q) => {
// 			const queryString = `legalities.${q}`;
// 			condition[queryString] = "legal";
// 		});
// 	}
// 	if (req.query.rarity) {
// 		condition["rarity"] = req.query.rarity;
// 	}

// 	condition["set_type"] = { $in: ["expansion", "masters", "core"] };
// 	condition.promo = false;
// 	condition["booster"] = true;
// 	console.log(condition);

// 	const { limit, offset } = getPagination(page, size);

// 	const options = {
// 		limit,
// 		offset,
// 		sort: {
// 			name: 1,
// 			cmc: 1,
// 		},
// 		select: {
// 			name: 1,
// 			image_uris: {
// 				normal: 1,
// 			},
// 			colors: 1,
// 			mana_cost: 1,
// 			rarity: 1,
// 			legalities: 1,
// 		},
// 	};

// 	Card.paginate(condition, options)
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

// router.get("/q", async (req, res) => {
// 	const query = req.query;
// 	const name = req.query.name;
// 	const legalities = req.query.legalities;
// 	const filters = {};
// 	if (query.name) {
// 		filters.name = {
// 			$regex: new RegExp(name),
// 			$options: "i",
// 		};
// 	}
// 	if (query.legalities) {
// 		const querySplit = query.legalities.split(",");
// 		querySplit.map((q) => {
// 			const queryString = `legalities.${q}`;
// 			filters[queryString] = "legal";
// 		});
// 	}
// 	if (query.colors) {
// 		//["W","U","B","R","G"]
// 		//NOT WORKING CORRECTLY
// 		thing = query.colors.split("");
// 		filters.colors = { $all: thing };
// 	}
// 	if (query.rarity) {
// 		// 'common', 'uncommon', 'rare', 'mythic'
// 		filters.rarity = query.rarity;
// 	}

// 	const { limit, offset } = getPagination(req.query.page, req.query.size);

// 	Card.paginate(filters, { offset, limit })
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
	const { page = 1, size = 10, name } = req.query;
	const limit = parseInt(size);

	var condition = {};
	if (req.query.name) {
		condition["name"] = {
			$regex: new RegExp("^" + name),
			$options: "i",
		};
	}
	if (req.query.id) {
		condition["id"] = req.query.id;
	}
	if (req.query.colors) {
		// BGRUW is the color order.
		colorsList = req.query.colors.toUpperCase().split(",");
		condition.colors = { $all: colorsList };
	}
	if (req.query.legalities) {
		const querySplit = req.query.legalities.split(",");
		querySplit.map((q) => {
			const queryString = `legalities.${q}`;
			condition[queryString] = "legal";
		});
	}
	if (req.query.rarity) {
		condition["rarity"] = req.query.rarity;
	}

	const cardFilters = {
		set_type: { $in: ["expansion", "masters", "core"] },
		promo: false,
		booster: true,
	};

	const options = {
		sort: {
			name: 1,
			cmc: 1,
		},
		select: {
			name: 1,
			image_uris: {
				normal: 1,
			},
			colors: 1,
			mana_cost: 1,
			rarity: 1,
			legalities: 1,
		},
	};
	const numOfDocs = await Card.aggregate([
		{
			$match: condition,
		},
		{
			$group: {
				_id: "$oracle_id",
			},
		},
		{
			$count: "docs",
		},
	]);

	// const pages = Math.ceil(numOfDocs[0].docs / limit);
	console.log(condition);
	const results = await Card.aggregate([
		{
			$match: condition,
		},
		{
			$group: {
				_id: "$oracle_id",
			},
		},
		{
			$limit: limit,
		},
	]);
	const idList = results.map((item) => {
		return item._id;
	});
	// Takes in array of Id's and queries for card data
	const someFunction = (idList) => {
		const promises = Card.find({
			oracle_id: { $in: idList },
			set_type: { $in: ["expansion", "masters", "core"] },
			promo: false,
			booster: true,
			reprint: false,
		}).sort({ name: 1 });
		return promises;
	};
	const mapResults = await someFunction(idList);
	// const endResults = mapResults.flat().flat();
	res.json(mapResults);
});

module.exports = router;
