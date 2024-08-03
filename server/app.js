const express = require("express");
const cors = require("cors");
const connection = require("./db/connection");
const roleRoute = require("./routes/roleRoutes");
const userRoute = require("./routes/userRoutes");
const seasonRoute = require("./routes/seasonRoutes");
const roundRoute = require("./routes/roundsRoutes");
const teamRoute = require("./routes/teamRoutes");
const notificationRoute = require("./routes/notificationRoutes");
const leagueRoute = require("./routes/leagueRoutes");
const invitationRoute = require("./routes/invitationRoutes");
const matchRoute = require("./routes/matchRoutes");
const zoneRoute = require("./routes/zoneRoutes");
const messageRoute = require("./routes/messageRoutes");
const sponsorRoute = require("./routes/sponsorRoutes");
const sponsorRoute = require("./routes/sponsorRoutes");
const socialMediaRoute = require("./routes/socialMediaRoutes");
const bettingRoute = require("./routes/bettingRoutes");

const countdownRoute = require("./routes/countdownRoutes");
const adminNotificationRoute = require("./routes/adminNotificationRoutes");
const PORT = 6010;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./my-upload"));

app.use("/role", roleRoute);
app.use("/zone", zoneRoute);
app.use("/user", userRoute);
app.use("/season", seasonRoute);
app.use("/round", roundRoute);
app.use("/team", teamRoute);
app.use("/notification", notificationRoute);
app.use("/league", leagueRoute);
app.use("/invitation", invitationRoute);
app.use("/match", matchRoute);
app.use("/bet", bettingRoute);
app.use("/message", messageRoute);
app.use("/sponsor", sponsorRoute);
app.use("/socialmedia", socialMediaRoute);
app.use("/countdown",countdownRoute);
app.use("/adminnotification",adminNotificationRoute);

app.listen(PORT, () => {
  console.log(`server has started at port ${PORT}`);
});
