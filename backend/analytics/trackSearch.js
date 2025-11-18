// backend/analytics/trackSearch.js
const SearchLog = require("../models_mongo/SearchLog");

module.exports = async function trackSearch(req, res, next) {
  if (req.session?.user) {
    await SearchLog.create({
      userId: req.session.user.id,
      depart: req.query.depart || "",
      arrivee: req.query.arrivee || ""
    });
  }
  next();
};
