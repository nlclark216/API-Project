const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { requireAuth, reviewAuth } = require('../../utils/auth');

const router = express.Router();

const { Review, Spot, ReviewImage, User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReview = [
    check('review')
        .exists({checkFalsy: true})
        .isString()
        .notEmpty()
        .withMessage('Review text is required'),
    check('stars')
        .isInt({min: 1, max: 5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    const reviews = await Review.findAll({
        where: { userId: user.id },
        include: [{ 
            model: User,
            attributes: ['id', 'firstName', 'lastName']
        }, { 
            model: Spot,
            attributes: {exclude: ["description", 'createdAt', 'updatedAt']}
        }, { 
            model: ReviewImage ,
            attributes: ['id', 'url']
        }]
    });

    // add function: cannot find spot with specified id

    res.json(reviews);
});

router.put('/:reviewId', requireAuth, reviewAuth, validateReview, async (req, res) => {
    const { review, stars } = req.body;
    const { reviewId } = req.params;

    const findReview = await Review.findByPk(reviewId);

    if(!findReview){
        return res.status(404).json({
            message: "Review couldn't be found"
          });
    };

    await findReview.update({
        review:review,
        stars:stars
    });
    return res.json(findReview);
});

router.delete('/:reviewId', requireAuth, reviewAuth, async (req, res) => {
    const { reviewId } = req.params;
    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {return res.status(404).json({message: "Review couldn't be found"})}
    existingReview.destroy();
    return res.status(200).json({message: "Successfully deleted"});

});

router.post('/:reviewId/images', requireAuth, reviewAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { url } = req.body;

    const targetReview = await Review.findByPk(reviewId);

    if (!targetReview) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }

    const images = await ReviewImage.findAll({
        where: { reviewId: reviewId }
    })
 
    if (images.length >= 10) {
        return res.status(403).json({ 
            message: "Maximum number of images for this resource was reached" 
        });
    }

    const newImage = await targetReview.createReviewImage({ url });

    return res.status(201).json({
        id: newImage.id,
        url: newImage.url
    }); 
});

module.exports = [ router, validateReview ];
