const { Router } = require('express');
const Card = require('../models/Card');
const querystring = require('querystring');

const router = Router();

router.get('/singlecard/:id', async (req, res) => {
  try {
    let Id = req.params.id;
    const results = await Card.findOne({
      id: Id,
    });
    res.status(200).send(results);
  } catch (err) {
    res.status(400).json(err);
  }
});

// TESTING FOR NEW ALGO for search field.
router.get('/', async (req, res) => {
  const limit = req.query.limit || 12;
  const page = req.query.page || 1;
  const offset = limit * (page - 1);

  /* START OF TEST CODE */
  var condition = {};
  if (req.query.name) {
    condition['name'] = {
      $regex: new RegExp('^' + req.query.name + '|' + req.query.name + '$'),
      $options: 'i',
    };
  }
  if (req.query.id) {
    condition['id'] = req.query.id;
  }
  if (req.query.colors) {
    // BGRUW is the color order.
    colorsList = req.query.colors.toUpperCase().split(',');
    console.log(colorsList);
    condition.colors = { $all: colorsList };
  }
  if (req.query.legalities) {
    const querySplit = req.query.legalities.split(',');
    querySplit.map((q) => {
      const queryString = `legalities.${q}`;
      condition[queryString] = 'legal';
    });
  }
  if (req.query.rarity) {
    let rarityList = req.query.rarity.toLowerCase().split(',');
    condition['rarity'] = { $in: rarityList };
  }
  if (req.query.set) {
    condition['set'] = req.query.set.toLowerCase();
  }

  const cardFilters = {
    set_type: { $in: ['expansion', 'masters', 'core'] },
    promo: false,
    booster: true,
  };

  // Combines condition with filters for cleaner code
  condition = { ...condition, ...cardFilters };
  console.log(condition);
  const options = {
    sort: {
      name: 1,
      cmc: 1,
    },
    // select: {
    // 	name: 1,
    // 	image_uris: {
    // 		normal: 1,
    // 	},
    // 	colors: 1,
    // 	mana_cost: 1,
    // 	rarity: 1,
    // 	legalities: 1,
    // },
  };
  /* END OF TEST CODE */

  const count = await Card.find(condition).countDocuments();

  const result = await Card.find(condition)
    .skip(offset)
    .sort({ name: 1 })
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

module.exports = router;
