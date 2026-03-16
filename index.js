const { Novu } = require('@novu/node');

// Replace with your actual Novu API Key from the dashboard
const novu = new Novu('<YOUR_NOVU_API_KEY>');

const triggerNotification = async () => {
  await novu.trigger('push-notification-workflow', {
    to: {
      subscriberId: 'subscriber_123',
    },
    payload: {
      title: 'Hello from Novu!',
      body: 'This push notification was sent via Firebase.',
    },
  });
  console.log('Notification triggered successfully;');
};

triggerNotification();
