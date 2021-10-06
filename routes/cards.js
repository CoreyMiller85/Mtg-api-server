const { Router } = require("express");
const Card = require("../models/Card");
const mongoosePaginate = require("mongoose-paginate-v2");

const router = Router();

const getPagination = (page, size) => {
	const limit = size ? +size : 10;
	const offset = page ? page * limit : 0;

	return { limit, offset };
};

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

	condition["set_type"] = { $in: ["expansion", "masters", "core"] };
	condition.promo = false;
	condition["booster"] = true;
	console.log(condition);

	const { limit, offset } = getPagination(page, size);

	const options = {
		limit,
		offset,
		sort: {
			cmc: 1,
		},
		select: {
			name: 1,
			image_uris: {
				large: 1,
			},
			colors: 1,
			mana_cost: 1,
			rarity: 1,
			legalities: 1,
		},
	};

	Card.paginate(condition, options)
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
