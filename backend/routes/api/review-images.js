const express = require('express');
const router = express.Router();


const { requireAuth } = require('../../utils/auth');

router.delete('/:imageId', requireAuth, async (req, res) => {

});





module.exports = router;