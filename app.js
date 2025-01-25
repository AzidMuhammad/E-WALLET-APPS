const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const Cooperative = require("./models/Cooperative");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notification");
const walletRoutes = require('./routes/wallet');
const cooperativeRoutes = require('./routes/cooperative');
const statisticRoutes = require('./routes/statistic');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/notification", notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/cooperative', cooperativeRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/user', userRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "KooPay",
  })
  .then(() => {
    console.log("Connected to MongoDB");

    const syncData = async () => {
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
    };

    syncData();
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
