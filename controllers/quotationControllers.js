// quotationController.js
const Quotation = require("../models/quotation");
const jwt = require("jsonwebtoken");

// In your backend API controller

exports.createQuotation = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token with your secret key
    const userId = decodedToken.userId; // Assuming your JWT payload includes a field for user ID

    const {
      productName,
      productTitle,
      sizeOfPaper,
      paperColor,
      grammageForPaper,
      numberOfCopies,
      numberOfCover,
      grammageOfCard,
      sizeOfCard,
      designCost,
      plateMakingCost,
      runningCost,
      noOfColorsText,
      numberOfPages,
      finishingCosts,
      editingCost,
      impressionCost,
      address,
      date,
    } = req.body;

    // Create a new quotation with user ID
    const quotation = new Quotation({
      userId,
      productName,
      productTitle,
      sizeOfPaper,
      paperColor,
      grammageForPaper,
      numberOfCopies,
      numberOfCover,
      grammageOfCard,
      sizeOfCard,
      designCost,
      plateMakingCost,
      runningCost,
      noOfColorsText,
      numberOfPages,
      finishingCosts,
      editingCost,
      impressionCost,
      address,
      date,
    });

    const requiredFields = [
      "productName",
      "productTitle",
      "sizeOfPaper",
      "paperColor",
      "grammageForPaper",
      "numberOfCopies",
      "numberOfCover",
      "grammageOfCard",
      "sizeOfCard",
      "designCost",
      "plateMakingCost",
      "noOfColorsText",
      "numberOfPages",
      "finishingCosts",
      "impressionCost",
      "address",
      "date",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
    }

    await quotation.save();
    res.status(200).send("Quotation saved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to save quotation");
  }
};

exports.getQuotations = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Use optional chaining to prevent error if Authorization header is missing
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Verify the token and extract the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    // Find quotations belonging to the authenticated user
    let quotations = await Quotation.find({ userId });

    quotations = quotations.sort((a, b) => a.date - b.date); // Sort by date in descending order

    res.status(200).json(quotations);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch quotations");
  }
};

exports.editQuotation = async (req, res) => {
  console.log(req.body);
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    const quotationId = req.params.id;

    const quotation = await Quotation.findOne({ _id: quotationId, userId });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const {
      productName,
      productTitle,
      sizeOfPaper,
      paperColor,
      grammageForPaper,
      numberOfCopies,
      numberOfCover,
      grammageOfCard,
      sizeOfCard,
      designCost,
      plateMakingCost,
      runningCost,
      noOfColorsText,
      numberOfPages,
      finishingCosts,
      editingCost,
      impressionCost,
      address,
      date,
    } = req.body;

    // Update the quotation with new details
    quotation.productName = productName;
    quotation.productTitle = productTitle;
    quotation.sizeOfPaper = sizeOfPaper;
    quotation.paperColor = paperColor;
    quotation.grammageForPaper = grammageForPaper;
    quotation.numberOfCopies = numberOfCopies;
    quotation.numberOfCover = numberOfCover;
    quotation.grammageOfCard = grammageOfCard;
    quotation.sizeOfCard = sizeOfCard;
    quotation.designCost = designCost;
    quotation.plateMakingCost = plateMakingCost;
    quotation.runningCost = runningCost;
    quotation.noOfColorsText = noOfColorsText;
    quotation.numberOfPages = numberOfPages;
    quotation.finishingCosts = finishingCosts;
    quotation.editingCost = editingCost;
    quotation.impressionCost = impressionCost;
    quotation.address = address;
    quotation.date = date;

    await quotation.save();
    res
      .status(200)
      .json({ message: "Quotation updated successfully", quotation });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update quotation");
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    const quotationId = req.params.id; // Assuming the quotation ID is passed as a route parameter

    // Find the quotation by ID and user ID
    const quotation = await Quotation.findOne({ _id: quotationId, userId });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Delete the quotation
    await Quotation.deleteOne({ _id: quotationId });

    res.status(200).json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete quotation");
  }
};
