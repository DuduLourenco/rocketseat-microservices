import { orders } from "./channels/orders.ts";

orders.consume(
  "orders",
  async (message) => {
    if (!message) return null;

    console.log(message?.content.toString());

    orders.ack(message);
  },
  {
    noAck: false, //acknowledge => reconhecer // false indica que não quero que a mensagem seja dita como "recebida" automaticamente
  }
);
