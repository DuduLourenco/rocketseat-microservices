import amqp from "amqplib"

console.log(process.env.BROKER_URL);
if(!process.env.BROKER_URL) {
  throw new Error("BROKER_URL must be configured.")
}

export const broker = await amqp.connect(process.env.BROKER_URL)