import { Kafka, logLevel } from 'kafkajs';

// Initialize the Kafka client
export const kafka = new Kafka({
  clientId: 'futsala-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  logLevel: logLevel.ERROR, // Set to INFO or DEBUG for more verbosity
});
