require("dotenv").config();
const express = require("express");
const { Novu } = require("@novu/api");
const { ChatOrPushProviderEnum } = require("@novu/api/models/components");

const app = express();
app.use(express.json());

// Initialize Novu with your secret key
const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY,
});

/**
 * POST /register-subscriber
 *
 * Creates (or updates) a Novu subscriber and stores their
 * FCM device token so Novu can route push notifications to them.
 *
 * Body:
 *   subscriberId  - unique ID for this user in your system
 *   firstName     - subscriber's first name (optional)
 *   email         - subscriber's email (optional)
 *   deviceToken   - the FCM registration token from the client device
 */
app.post("/register-subscriber", async (req, res) => {
  const { subscriberId, firstName, email, deviceToken } = req.body;

  if (!subscriberId || !deviceToken) {
    return res
      .status(400)
      .json({ error: "subscriberId and deviceToken are required." });
  }

  try {
    // Step 1 — Create or update the subscriber profile in Novu
    await novu.subscribers.create({
      subscriberId,
      firstName: firstName || "",
      email: email || "",
    });

    // Step 2 — Attach the FCM device token to the subscriber's profile
    await novu.subscribers.credentials.update(
      {
        providerId: ChatOrPushProviderEnum.Fcm,
        credentials: {
          deviceTokens: [deviceToken],
        },
      },
      subscriberId
    );

    return res.status(200).json({
      message: `Subscriber "${subscriberId}" registered and FCM token saved.`,
    });
  } catch (error) {
    console.error("Error registering subscriber:", error);
    return res.status(500).json({ error: "Failed to register subscriber." });
  }
});

/**
 * POST /send-notification
 *
 * Triggers a push notification to a subscriber via Novu,
 * which routes the message through Firebase Cloud Messaging (FCM).
 *
 * Body:
 *   subscriberId - the Novu subscriber to notify
 *   title        - notification title
 *   body         - notification body text
 */
app.post("/send-notification", async (req, res) => {
  const { subscriberId, title, body } = req.body;

  if (!subscriberId || !title || !body) {
    return res
      .status(400)
      .json({ error: "subscriberId, title, and body are required." });
  }

  try {
    await novu.trigger({
      workflowId: process.env.NOVU_WORKFLOW_ID,
      to: {
        subscriberId,
      },
      payload: {
        title,
        body,
      },
    });

    return res.status(200).json({
      message: `Push notification sent to subscriber "${subscriberId}".`,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification." });
  }
});

/**
 * POST /send-notification-topic
 *
 * Sends a push notification to an FCM topic (multiple devices at once).
 * Useful for broadcasting to groups of users (e.g. "all-users", "premium").
 *
 * Body:
 *   subscriberId - the Novu subscriber triggering the workflow
 *   title        - notification title
 *   body         - notification body text
 *   topic        - the FCM topic name to broadcast to
 */
app.post("/send-notification-topic", async (req, res) => {
  const { subscriberId, title, body, topic } = req.body;

  if (!subscriberId || !title || !body || !topic) {
    return res
      .status(400)
      .json({ error: "subscriberId, title, body, and topic are required." });
  }

  try {
    await novu.trigger({
      workflowId: process.env.NOVU_WORKFLOW_ID,
      to: {
        subscriberId,
      },
      payload: {
        title,
        body,
      },
      overrides: {
        providers: {
          fcm: {
            topic,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Push notification sent to FCM topic "${topic}".`,
    });
  } catch (error) {
    console.error("Error sending topic notification:", error);
    return res
      .status(500)
      .json({ error: "Failed to send topic notification." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
