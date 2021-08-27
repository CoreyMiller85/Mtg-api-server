const { Router } = require("express");
const tokenValidation = require("../middleware/tokenValidation");
const mongoosePaginate = require("mongoose-paginate-v2");

const router = Router();

router.get("/", tokenValidation, (req, res) => {
	res.send("decks");
});

module.exports = router;
