const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
  name: { type: String, required: true },
  price: { type: Number, required: true },
  label: { type: String }, // Assuming label is optional
});

const Prices = mongoose.model("Prices", priceSchema);

module.exports = Prices;
