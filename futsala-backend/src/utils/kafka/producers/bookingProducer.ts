import { kafka } from '../client';

const producer = kafka.producer();
let isConnected = false;

export const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('✅ Kafka Producer connected');
  }
};

export const disconnectProducer = async () => {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
    console.log('❌ Kafka Producer disconnected');
  }
};

export const publishBookingEvent = async (
  eventType: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED',
  payload: any
) => {
  try {
    await connectProducer();

    await producer.send({
      topic: 'bookings-topic',
      messages: [
        {
          key: payload.id || 'booking-event',
          value: JSON.stringify({ eventType, data: payload, timestamp: new Date().toISOString() }),
        },
      ],
    });

    console.log(`[Kafka] Published ${eventType} for booking ID: ${payload.id}`);
  } catch (error) {
    console.error(`[Kafka] Error publishing ${eventType}:`, error);
  }
};
