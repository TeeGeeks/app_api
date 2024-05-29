const Prices = require("../models/price");
const jwt = require("jsonwebtoken");
const secretKey = "teegeekstoken";

exports.savePrice = async (req, res) => {
  try {
    const { prices } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;

    if (!Array.isArray(prices)) {
      return res.status(400).json({ message: "Prices must be an array" });
    }

    for (const priceEntry of prices) {
      const { name, price, label } = priceEntry;

      await Prices.findOneAndUpdate(
        { name, label, userId },
        { name, price, label, userId },
        { upsert: true }
      );
    }

    res.status(201).json({ message: "Prices saved successfully" });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Failed to save prices" });
  }
};

exports.getAllPrices = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const decodedToken = jwt.verify(token, secretKey);

    // Check user role and permissions before fetching prices
    // const authorized = await checkUserPermissions(
    //   decodedToken.userId,
    //   "READ_PRICES"
    // ); // Replace with your permission check function
    // if (!authorized) {
    //   return res.status(403).json({ message: "Unauthorized to view prices" });
    // }

    const prices = await Prices.find({ userId: decodedToken.userId });
    res.status(200).json(prices);
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Failed to fetch prices" });
  }
};
