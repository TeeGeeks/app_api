const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
  productName: { type: String, required: true },
  productTitle: { type: String, required: true },
  sizeOfPaper: { type: String, required: true },
  paperColor: { type: String, required: true },
  // pagesNumber: { type: Number, required: true },
  grammageForPaper: { type: Number, required: true },
  numberOfCopies: { type: Number, required: true },
  numberOfCover: { type: String, required: true },
  grammageOfCard: { type: Number, required: true },
  sizeOfCard: { type: String, required: true },
  designCost: { type: Number, required: true },
  plateMakingCost: { type: Number, required: true },
  runningCost: { type: Number },
  noOfColorsText: { type: String, required: true },
  numberOfPages: { type: Number, required: true },
  finishingCosts: { type: Array, required: true },
  editingCost: { type: Number },
  impressionCost: { type: Number, required: true },
  address: { type: String, required: true },
  date: { type: Date, required: true },
});

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
