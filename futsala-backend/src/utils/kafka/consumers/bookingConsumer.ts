import { kafka } from '../client';

const consumer = kafka.consumer({ groupId: 'futsala-booking-group' });
let isConnected = false;

export const startBookingConsumer = async () => {
  try {
    if (!isConnected) {
      await consumer.connect();
      isConnected = true;
      console.log('✅ Kafka Consumer connected');
    }

    await consumer.subscribe({ topic: 'bookings-topic', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        try {
          const event = JSON.parse(message.value.toString());
          console.log(`[Kafka Consumer] Received ${event.eventType} on partition ${partition}`);

          // Here you can add specific logic based on the eventType
          switch (event.eventType) {
            case 'BOOKING_CREATED':
              console.log(`  -> Processing BOOKING_CREATED for ID: ${event.data.id}`);
              // TODO: Add notification logic, email sending, etc.
              break;
            case 'BOOKING_CANCELLED':
              console.log(`  -> Processing BOOKING_CANCELLED for ID: ${event.data.id}`);
              break;
            case 'BOOKING_RESCHEDULED':
              console.log(`  -> Processing BOOKING_RESCHEDULED for ID: ${event.data.id}`);
              break;
            default:
              console.log(`  -> Unknown event type: ${event.eventType}`);
          }
        } catch (err) {
          console.error('[Kafka Consumer] Error processing message:', err);
        }
      },
    });
  } catch (error) {
    console.error('[Kafka Consumer] Error starting consumer:', error);
  }
};

export const stopBookingConsumer = async () => {
  if (isConnected) {
    await consumer.disconnect();
    isConnected = false;
    console.log('❌ Kafka Consumer disconnected');
  }
};
