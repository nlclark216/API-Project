const express = require('express');
const router = express.Router();


const { requireAuth, imgAuth } = require('../../utils/auth');

const { ReviewImage } = require('../../db/models');

router.delete('/:imageId', requireAuth, imgAuth, async (req, res) => {
    const { imageId } = req.params;
    const img = await ReviewImage.findByPk(imageId);

    if(!img) return res.status(404).json({
        "message": "Review Image couldn't be found"
      });
    
    await img.destroy();

    return res.status(200).json({
        "message": "Successfully deleted"
      });
});





module.exports = router;