const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.send('GET request to the homepage')
});

router.post('/', async (req, res) => {
    res.send('POST request to the homepage');
});
module.exports = router;