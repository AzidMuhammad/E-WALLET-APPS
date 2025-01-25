require("dotenv").config();
const mongoose = require("mongoose");
const Cooperative = require("../models/Cooperative");
const User = require("../models/User");

const syncData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const cooperatives = await Cooperative.find();

    for (const cooperative of cooperatives) {
      for (const memberId of cooperative.members) {
        const user = await User.findById(memberId);
        if (user && !user.cooperativeGroups.includes(cooperative._id)) {
          user.cooperativeGroups.push(cooperative._id);
          await user.save();
        }
      }
    }

    console.log("Data synchronized successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing data:", error);
    process.exit(1);
  }
};

syncData();
