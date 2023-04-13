const router = require("express").Router();
const { User, CarReview, Comment } = require("../models");
const withAuth = require("../utils/auth");
const carData = require("../utils/carData.js")
const { Op } = require("sequelize");
const searchArray = require('search-array');

// This route will display all posts on homepage

router.get("/", async (req, res) => {
  try {
    const carReviewData = await CarReview.findAll({
      order: [["date_reviewcreated", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
        },
      ],
    });

    const carReviews = carReviewData.map((carReview) =>
      carReview.get({
        plain: true,
      })
    );

    res.render("homepage", {
      carReviews,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// This route will retrieve reviews according to its id

router.get("/carReview/:id", withAuth, async (req, res) => {
  try {
    const carReviewData = await CarReview.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
        },
        {
          model: Comment,
          include: [User],
          order: [["date_commentcreated", "DESC"]],
        },
      ],
    });

    const carReview = carReviewData.get({
      plain: true,
    });

    const isCreator = req.session.user_id === carReview.creator.id;

    res.render("carReview", {
      ...carReview,
      logged_in: req.session.logged_in,
      isCreator,
      googleApiKey: process.env.GOOGLE_API_KEY,
      searchEngineId: process.env.SEARCH_ENGINE_ID,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// for dashboard
router.get("/dashboard", withAuth, async (req, res) => {
  try {
    const userId = req.session.user_id;

    const dbcarReviewData = await CarReview.findAll({
      where: {
        creator_id: userId,
      },
      include: [
        {
          model: User,
          as: "creator",
        },
      ],
    });

    const carReviews = dbcarReviewData.map((review) =>
      review.get({ plain: true })
    );
    // Get the user information
    const userData = await User.findByPk(userId);
    // Render the dashboard view with the username
    res.render("dashboard", {
      carReviews,
      cars: carData.cars,
      makes: carData.car_makes(),
      logged_in: req.session.logged_in,
      username: userData.username, // Add the username here
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//for edit review
router.get("/edit-review/:id", withAuth, async (req, res) => {
  try {
    const dbreviewData = await CarReview.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
        },
      ],
    });

    if (!dbreviewData) {
      res.status(404).json({ message: "No reviews found with this id" });
      return;
    }

    const reviewData = dbreviewData.get({ plain: true });

    if (reviewData.creator_id !== req.session.user_id) {
      res
        .status(403)
        .json({ message: "You are not authorized to edit this review" });
      return;
    }

    res.render("edit-review", {
      review: reviewData,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/edit-review/:id", withAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { title, carReview } = req.body;

    const review = await CarReview.findByPk(reviewId);

    if (!review) {
      res.status(404).json({ message: "No review found with this id" });
      return;
    }

    if (review.creator_id !== req.session.user_id) {
      res
        .status(403)
        .json({ message: "You are not authorized to edit this review" });
      return;
    }

    await CarReview.update(
      {
        title,
        carReview,
        post_date: new Date(),
      },
      {
        where: {
          id: reviewId,
        },
      }
    );

    res.status(200).json({ message: "Review updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//for login
router.get("/login", (req, res) => {
  if (req.session.logged_in) {
    res.redirect("/dashboard");
    return;
  }

  res.render("login");
});

router.get("/signUp", (req, res) => {
  if (req.session.logged_in) {
    res.redirect("/dashboard");
    return;
  }
  res.render("signUp");
});

module.exports = router;

// Search route
// router.get("/search", withAuth, async (req, res) => {
//   try {
//     const searchTerm = req.query.q;

//     const carReviewData = await CarReview.findAll({
//       where: {
//         title: {
//           [Op.substring]: searchTerm,
//         },
//       },
//       order: [["date_reviewcreated", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "creator",
//         },
//       ],
//     });

//     const carReviews = carReviewData.map((carReview) =>
//       carReview.get({
//         plain: true,
//       })
//     );

//     res.render("searchResults", {
//       carReviews,
//       logged_in: req.session.logged_in,
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.get('/search', async (req, res) => {
  try {
    const carReviewData = await CarReview.findAll({
      order: [['date_reviewcreated', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
        },
      ],
    });

    const carReviews = carReviewData.map((carReview) => carReview.get({ plain: true }));

    // Get the search query from the request
    const query = req.query.q;

    // Filter carReviews based on the search query for carmake or carmodel
    const searchResult = carReviews.filter((review) =>
      review.carmake.toLowerCase().includes(query.toLowerCase()) ||
      review.carmodel.toLowerCase().includes(query.toLowerCase())
    );

    // Render the search results
    res.render('searchResults', {
      searchResult,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
