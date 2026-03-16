# Novu + Firebase Cloud Messaging (FCM) — Push Notifications

A Node.js/Express backend that integrates [Novu](https://novu.co) with [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) to send push notifications to users' devices.

---

## Prerequisites

Before you start, make sure you have the following:

- [Node.js](https://nodejs.org/) v18 or higher
- A [Novu](https://dashboard.novu.co) account
- A [Firebase](https://console.firebase.google.com/) project with FCM enabled

---

## Project Structure

```
novu-firebase-fcm/
├── index.js          # Express server with all API routes
├── package.json      # Project dependencies
├── .env.example      # Environment variable template
└── README.md         # You're reading it!
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/novu-firebase-fcm.git
cd novu-firebase-fcm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and add your keys:

```
NOVU_SECRET_KEY=your_novu_secret_key_here
NOVU_WORKFLOW_ID=your_workflow_trigger_id_here
PORT=3000
```

> You can find your Novu Secret Key under **Settings > API Keys** in your [Novu dashboard](https://dashboard.novu.co).

### 4. Configure Firebase in Novu

1. Go to your [Firebase Console](https://console.firebase.google.com/) → **Project Settings** → **Service Accounts**.
2. Click **Generate new private key** and download the JSON file.
3. In your [Novu dashboard](https://dashboard.novu.co), go to **Integrations Store** and enable **Firebase Cloud Messaging**.
4. Paste the entire contents of the downloaded JSON file into the **Service Account** field and save.

### 5. Create a Novu Workflow

1. In your Novu dashboard, go to **Workflows** and click **Add a workflow**.
2. Select **Blank Workflow**.
3. Drag a **Push** step below the trigger node.
4. Set the **title** and **body** using variables: `{{title}}` and `{{body}}`.
5. Save the workflow and copy the **trigger identifier** — this is your `NOVU_WORKFLOW_ID`.

### 6. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

The server runs at `http://localhost:3000`.

---

## API Endpoints

### `POST /register-subscriber`

Creates a subscriber in Novu and saves their FCM device token.

**Request body:**

```json
{
  "subscriberId": "user_123",
  "firstName": "Jane",
  "email": "jane@example.com",
  "deviceToken": "FCM_DEVICE_TOKEN_FROM_CLIENT"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/register-subscriber \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": "user_123",
    "firstName": "Jane",
    "email": "jane@example.com",
    "deviceToken": "your_fcm_device_token"
  }'
```

---

### `POST /send-notification`

Triggers a push notification to a single subscriber.

**Request body:**

```json
{
  "subscriberId": "user_123",
  "title": "Hello!",
  "body": "You have a new message."
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": "user_123",
    "title": "Hello!",
    "body": "You have a new message."
  }'
```

---

### `POST /send-notification-topic`

Broadcasts a push notification to an FCM topic (all devices subscribed to that topic).

**Request body:**

```json
{
  "subscriberId": "user_123",
  "title": "Announcement",
  "body": "A new feature just dropped!",
  "topic": "all-users"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/send-notification-topic \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": "user_123",
    "title": "Announcement",
    "body": "A new feature just dropped!",
    "topic": "all-users"
  }'
```

---

## How It Works

1. **Your client app** (web or mobile) requests an FCM device token from Firebase.
2. **Your client** sends that token to your backend via `POST /register-subscriber`.
3. **The backend** creates a Novu subscriber and attaches the FCM token to their profile.
4. When you want to notify a user, call `POST /send-notification`.
5. **Novu** receives the trigger, looks up the subscriber's FCM token, and sends the push notification through **Firebase Cloud Messaging**.
6. **FCM** delivers the notification to the user's device.

---

## Resources

- [Novu Documentation](https://docs.novu.co)
- [Novu FCM Integration Guide](https://docs.novu.co/platform/integrations/push/fcm)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Novu Node.js SDK](https://www.npmjs.com/package/@novu/api)
