require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
require("./services/passport");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

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
const socialMediaRoute = require("./routes/socialMediaRoutes");
const bettingRoute = require("./routes/bettingRoutes");
const countdownRoute = require("./routes/countdownRoutes");
const adminNotificationRoute = require("./routes/adminNotificationRoutes");
const settingRoute = require("./routes/settingRoutes");
const rankRoute = require("./routes/rankRoutes");
const authRoutes = require("./routes/authRoutes");
const pushNotificationRoute = require("./routes/pushNotificationRoutes");
const devicesRoute = require("./routes/deviceRoutes");

const PORT = process.env.PORT || 4000;
const app = express();
const backendUrl = process.env.BACKEND_URL;

// Middleware
// app.use(cookieSession({
//   maxAge: 24 * 60 * 60 * 1000, // 24 hours
//   keys: [process.env.COOKIE_KEY]
// }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(
  session({
    secret: process.env.COOKIE_KEY, // Use a more secure secret for production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: backendUrl,  // Allow requests from the frontend URL
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("my-upload"));

app.use("/role", roleRoute);
app.use("/user", userRoute);
app.use("/auth", authRoutes);
app.use("/zone", zoneRoute);
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
app.use("/countdown", countdownRoute);
app.use("/adminnotification", adminNotificationRoute);
app.use("/setting", settingRoute);
app.use("/rank", rankRoute);
app.use("/notifications", pushNotificationRoute);
app.use("/devices", devicesRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

app.listen(PORT, () => {
  console.log(`server has started at port ${PORT}`);
});
