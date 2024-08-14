require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
require("./services/passport");
const cors = require("cors");
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const PushNotifications = require("node-pushnotifications");
const firebaseAdmin = require("firebase-admin");

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
const deviceinfoRoute = require("./routes/deviceinfoRoutes");
const authRoutes = require("./routes/authRoutes");

const PORT = process.env.PORT || 6010;
const app = express();

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
app.use("/deviceinfo", deviceinfoRoute);
app.use("/rank", rankRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// Set static path

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: "node-app-f8403",
    clientEmail:
      "firebase-adminsdk-7dqfn@node-app-f8403.iam.gserviceaccount.com",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChHH2lvol/GUR/\nY6mNrmOR47/anp+VgM1koSNBGnbDeRH5KXiWLNScBUQHs9I13STd7fHS9LXjSROM\nhhCEgF26glJHXmgOsmtUleboC8vDp0notA4MA838Xt3e+V33hSF+0yCQoMjZ3L+6\nFl3OmQ7fgJIcGDx7dJ0171YiPq1yPArgUay/bI7IFk+tj2YnIkgL3mUZQkIrjwt9\n8DZ/Oz4joP+//6V0Xvmjrdp0pKd4SFqjTbxqJDgZEcTw3bdSCNtYHz6lmPMyRi/0\nzSR+0RV3PWKHzwoyxrAWWzB8yQzha8EpfDzfrfY+Ay00GJfcmwHH+0fNfgSeX0wv\n22DAvae5AgMBAAECggEAPuf182JbI2JFSYwrZuOhgxQvE/h9jQ1WpST5s/DWUGqU\nZvoXWGO2vBieQHeo61kmjPTcSCc+YbllxaePCX1pm2pJIA6viJWHrOY+23nHnORT\nymWLWoudwR11ehtZ4kx8EJ31CCOPaOl1fv4+sG04znHQGuIns3iL7cQ+mG5qoMBL\n7Wax/GOVSTjp39BNpzZxZpbuaXUQkaXWuXSWqk09t93V1/b/1KRBCfAASjIZauBq\neVLZ1eU0S3CaBjI1Arx+ht4gcRKDEL7qMQ/utdGLLkRds7Npbm6LFoX3ykvscyAI\n72LaOvGFPzscWd/7YQCKwvbJgzRLXk6LPQPjFIyfhQKBgQDZ9Z4bbqxlE6Cue8Lr\nCMxMSik72AZM5hV2MR8PMmApLq7MPS8w4B/zlKzJLYeGx2QFz5zfetjitX8jykYM\nwZerqqlLw0lPxqPGPLZ/aiBU1DxNEghe2oG0MGTPGNplKRAqQ7Nr1CV/t0MgtWOf\nzz7qaK+rr+m0cjToxHGEsls8lwKBgQC9OujgbbenCmyno9iSSxWKIzTLxVDyZJ0+\nq36bWeb/LSebaFq/MdpiNM9dJf7jeZRu+xMVaVs37gsWLE12WjQq2hVYGwQTE2qt\n/RjMTNePJbmVWraZ4P0MQTDplhOfot0awAKlMDD5NwrYWkm12Amg04UR2zFYTMzs\nOQfWJje4LwKBgH7/OFKvl8+FMji4cAhWpgNFquTtqC4iWhr14C0QoysbwknK1LZb\nwQJCfLLzzmXfxA4GvFcS01C1hBEsiMhh/KfP1rkIXq0XBtI5CfUPtyr2RvR5L1tl\nYfHFyNdKmeYbmQmnTOHlSLwz4e8rAZNaRER9Hu6gn0G+0clWvPYenj6dAoGAcyYN\n38PkJbmqNLj3aM5X5R9XWUhQ4a9oIGKrQE2My2rm1yLBVec4RNpt9PjSCgpJ0N7n\n1feuknJAPNXorURmyky7AEowSItgN0/0bx2zbmA+diwlQa4vTe29nea9Oj8Y3NZK\nxcp1grGD3/PRNt6nvT35k8wWUu0pJfXuVtoavfECgYBOpLwYtmy/rNZIyzEtOwwk\nXM/F6iVhC0YDAhhRQDbGcwZiqJnZedK5lg1b4yryna66IMxBwMXbcRKZoWe5G8eJ\nrwin01BKb8S/zLV6z6T37AnL4wnbnUrKy2LpEmFbsAjUw0Pj0Md6dkbCRgrxap5O\nZOwYCSNdCb5mY89CojUrnA==\n-----END PRIVATE KEY-----\n",
  }),
});

// Create a FCM messaging instance
const messaging = firebaseAdmin.messaging();

// Define a function to send a push notification
async function sendPushNotification(token, notification) {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
    };

    const response = await messaging.send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

// Define a function to send a push notification to multiple devices
async function sendPushNotificationToMultipleDevices(tokens, notification) {
  try {
    const messages = tokens.map((token) => ({
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
    }));

    const responses = await Promise.all(
      messages.map((message) => messaging.send(message))
    );
    console.log("Notifications sent successfully:", responses);
    return responses;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return null;
  }
}

// Define a function to subscribe a device to a topic
async function subscribeToDeviceTopic(token, topic) {
  try {
    await messaging.subscribeToTopic(token, topic);
    console.log(`Device subscribed to topic ${topic} successfully`);
    return true;
  } catch (error) {
    console.error(`Error subscribing device to topic ${topic}:`, error);
    return false;
  }
}

// Define a function to unsubscribe a device from a topic
async function unsubscribeFromDeviceTopic(token, topic) {
  try {
    await messaging.unsubscribeFromTopic(token, topic);
    console.log(`Device unsubscribed from topic ${topic} successfully`);
    return true;
  } catch (error) {
    console.error(`Error unsubscribing device from topic ${topic}:`, error);
    return false;
  }
}

// Create an endpoint to send a push notification
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;
  const notification = { title, body };
  const response = await sendPushNotification(token, notification);
  if (response) {
    res.status(200).send({ message: "Notification sent successfully" });
  } else {
    res.status(500).send({ message: "Error sending notification" });
  }
});

// Create an endpoint to send a push notification to multiple devices
app.post("/send-notification-to-multiple-devices", async (req, res) => {
  const { tokens, title, body } = req.body;
  const notification = { title, body };
  const responses = await sendPushNotificationToMultipleDevices(
    tokens,
    notification
  );
  if (responses) {
    res.status(200).send({ message: "Notifications sent successfully" });
  } else {
    res.status(500).send({ message: "Error sending notifications" });
  }
});

// Create an endpoint to subscribe a device to a topic
app.post("/subscribe-to-topic", async (req, res) => {
  const { token, topic } = req.body;
  const subscribed = await subscribeToDeviceTopic(token, topic);
  if (subscribed) {
    res
      .status(200)
      .send({ message: `Device subscribed to topic ${topic} successfully` });
  } else {
    res
      .status(500)
      .send({ message: `Error subscribing device to topic ${topic}` });
  }
});

// Create an endpoint to unsubscribe a device from a topic
app.post("/unsubscribe-from-topic", async (req, res) => {
  const { token, topic } = req.body;
  const unsubscribed = await unsubscribeFromDeviceTopic(token, topic);
  if (unsubscribed) {
    res.status(200).send({
      message: `Device unsubscribed from topic ${topic} successfully`,
    });
  } else {
    res
      .status(500)
      .send({ message: `Error unsubscribing device from topic ${topic}` });
  }
});

app.listen(PORT, () => {
  console.log(`server has started at port ${PORT}`);
});
