const express = require("express");
const cors = require("cors");
const connection = require("./db/connection");
const roleroute = require("./routes/roleRoute");
const userroute = require("./routes/userRoute");
const seasonroute = require("./routes/seasonRoute");
const roundRoute = require("./routes/roundsRoute");
const teamRoute = require("./routes/teamroute");
const notificationRoute = require("./routes/notificationRoute");
const leagueRoute = require("./routes/leagueroutes");
const invitationroute = require("./routes/invitationRoutes");
const MatchRoute = require("./routes/matchRoute");
const zoneRoute = require("./routes/zoneRoute");
const messageRoute = require("./routes/messageRoutes");
const sponsorRoute = require("./routes/sponsorRoutes");
const PORT = 6010;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./my-upload"));

app.use("/role", roleroute);
app.use("/zone", zoneRoute);
app.use("/user", userroute);
app.use("/season", seasonroute);
app.use("/round", roundRoute);
app.use("/team", teamRoute);
app.use("/notification", notificationRoute);
app.use("/league", leagueRoute);
app.use("/invitation", invitationroute);
app.use("/match", MatchRoute);
app.use("/message", messageRoute);
app.use("/sponsor", sponsorRoute);
app.listen(PORT, () => {
  console.log(`server has started at ${PORT}`);
});
