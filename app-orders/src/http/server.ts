import "@opentelemetry/auto-instrumentations-node/register";

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";

import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";

import { trace } from "@opentelemetry/api";

import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { channels } from "../broker/channels/index.ts";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";
import { tracer } from "../tracer/trancer.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*" });

//Toda aplicação que terá escalonamento horizontal
//Ou que terá como estratégia de deploy "Blue-green deployment"
//Deve ter uma rota "health" que verifica se a aplicação está funcionando e está respondendo em um tempo hábio
app.get("/health", () => {
  return "OK";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log("Creating an order with amount", amount);

    const orderId = randomUUID();

    await db.insert(schema.orders).values({
      id: orderId,
      customerId: "a9022f17-512a-436a-8d9c-5dcfe862bcee",
      amount,
    });

    const span = tracer.startSpan("eu acho que aqui ta demorando")
    span.setAttribute("teste", "hellow world")
    await setTimeout(2000)
    span.end()

    trace.getActiveSpan()?.setAttribute("order_id", orderId);

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: "a9022f17-512a-436a-8d9c-5dcfe862bcee",
      },
    });

    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP Server running!");
});
