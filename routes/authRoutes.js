const {Router} = require('express');
const router = Router();

router.get('/login', async (req, res) => {
  res.send('login GET')
})
router.get('/signup', async (req, res) => {
  res.send('signup GET')
})
router.post('/signup', async (req, res) => {
  res.send('signup POST')
})
router.post('/login', async (req, res) => {
  res.send('login POST')
})



module.exports = router;