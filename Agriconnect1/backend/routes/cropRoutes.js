import UpcomingHarvest from "../models/UpcomingHarvest.js";
import Crop from "../models/Crop.js";

// 1. GET standard harvested crops (For the Shop)
router.get("/ready-to-sell", async (req, res) => {
    const crops = await Crop.find(); 
    res.json(crops);
});

// 2. GET upcoming harvests (For the Prediction Dashboard)
router.get("/upcoming-forecast", async (req, res) => {
    const harvests = await UpcomingHarvest.find({
        expectedHarvestDate: { $gte: new Date() } // Only show future dates
    });
    res.json(harvests);
});

// 3. POST new upcoming harvest (Farmer adds this)
router.post("/add-upcoming", async (req, res) => {
    const newHarvest = new UpcomingHarvest(req.body);
    await newHarvest.save();
    res.json({ message: "Upcoming harvest listed for bulk buyers!" });
});