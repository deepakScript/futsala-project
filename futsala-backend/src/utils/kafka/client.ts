import { Kafka, logLevel } from 'kafkajs';
import env from '../../config/env.config';

// Initialize the Kafka client
export const kafka = new Kafka({
  clientId: 'futsala-backend',
  brokers: [env.KAFKA_BROKER],
  logLevel: logLevel.ERROR, // Set to INFO or DEBUG for more verbosity
});
