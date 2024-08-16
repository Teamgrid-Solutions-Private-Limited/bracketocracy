const webPush = require("web-push");
const Subscription = require("../model/subscriptionSchema"); // Adjust the path as needed
const Notification = require("../model/notificationSchema");

// Configure VAPID keys
// const vapidKeys = {
//   publicKey: process.env.VAPID_PUBLIC_KEY,
//   privateKey: process.env.VAPID_PRIVATE_KEY,
// };

// webPush.setVapidDetails(
//   "mailto:your-email@example.com",
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );

// const saveSubscription = async (subscription) => {
//   try {
//     await Subscription.create({
//       endpoint: subscription.endpoint,
//       p256dh: subscription.keys.p256dh,
//       auth: subscription.keys.auth,
//     });
//   } catch (error) {
//     console.error("Error saving subscription:", error);
//   }
// };

// const sendNotification = async (title, body, image) => {
//   try {
//     const subscriptions = await Subscription.find();
//     const payload = JSON.stringify({
//       notification: {
//         title,
//         body,
//         image,
//       },
//     });

//     subscriptions.forEach((subscription) => {
//       const sub = {
//         endpoint: subscription.endpoint,
//         keys: {
//           p256dh: subscription.p256dh,
//           auth: subscription.auth,
//         },
//       };

//       webPush
//         .sendNotification(sub, payload)
//         .catch((error) => console.error("Error sending notification:", error));
//     });
//   } catch (error) {
//     console.error("Error retrieving subscriptions:", error);
//   }
// };

// module.exports = {
//   saveSubscription,
//   sendNotification,
// };

//-----------------------next level code
// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webPush.setVapidDetails(
  "mailto:sksaruk.teamgridsolution@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Save subscription in the database
const saveSubscription = async (subscription) => {
  try {
    await Subscription.create({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });
    console.log("Subscription saved successfully.");
  } catch (error) {
    console.error("Error saving subscription:", error);
  }
};

// Send notification to all stored subscriptions
async function sendNotification(title, body) {
  try {
    const subscriptions = await Subscription.find().exec();
    const payload = JSON.stringify({
      notification: {
        title,
        body,
      },
    });

    subscriptions.forEach((subscription) => {
      const sub = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      webPush
        .sendNotification(sub, payload)
        .then(() => console.log("Notification sent successfully."))
        .catch((error) => console.error("Error sending notification:", error));
    });
  } catch (error) {
    console.error("Error retrieving subscriptions:", error);
  }
}

// Create and save notification record
async function createNotification(userId, title, text, status) {
  try {
    const notification = new Notification({
      userId,
      notificationTitle: title,
      notificationText: text,
      status,
    });
    await notification.save();
    console.log("Notification created and saved successfully.");
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Export functions
module.exports = { saveSubscription, sendNotification, createNotification };
