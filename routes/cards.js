const {Router} = require('express');
const Card = require('../models/Card')
const router = Router();

router.get('/', async (req, res) => {
  let limit = Math.abs(req.query.limit) || 10;
  let page = (Math.abs(req.query.page) || 1) - 1;
  const results = await Card.find()
    .limit(limit)
    .skip(limit * page);
  res.send(results);
})

router.get("/:name", async (req, res) => {
  let found = await Card.find({
    name: { $regex: new RegExp("^" + req.params.name), $options: "i" },
  },null, {sort: {name: 1}}).limit(10);
  res.send(found);
});

module.exports = router;