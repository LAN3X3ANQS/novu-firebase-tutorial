const { Novu } = require('@novu/node');

// This script triggers the notification through the Firebase setup you created
const novu = new Novu('YOUR_NOVU_API_KEY');

async function testNotification() {
  await novu.trigger('firebase-push-test', {
    to: {
      subscriberId: 'test-user-1',
    },
    payload: {
      title: "It Works!",
      body: "This message was sent via Firebase + Novu."
    },
  });
  console.log("Notification sent!");
}

testNotification();
