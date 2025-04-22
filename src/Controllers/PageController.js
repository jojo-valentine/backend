// controllers/pageController.js
const User = require("../Model/User");

// import User from "./Model/User";

exports.getHomePageData = (req, res) => {
  const homeData = {
    message: "Welcome to the Home Page",
    data: {
      /* Home page specific data */
    },
  };
  // res.json(homeData);
  res.render("index", { user: req.user });
};

exports.getAboutPageData = (req, res) => {
  const aboutData = {
    message: "Learn more about us on the About Page",
    info: {
      /* About page specific data */
    },
  };
  res.json(aboutData);
};
