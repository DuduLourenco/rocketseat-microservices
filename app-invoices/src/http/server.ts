import "@opentelemetry/auto-instrumentations-node/register";

import "../broker/subscriber.ts";

import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: "*" })

//Toda aplicação que terá escalonamento horizontal
//Ou que terá como estratégia de deploy "Blue-green deployment"
//Deve ter uma rota "health" que verifica se a aplicação está funcionando e está respondendo em um tempo hábio
app.get("/health", () => {
  return "OK"
})

app.listen({ host: "0.0.0.0", port: 3334 }).then(() => {
  console.log("[Invoices] HTTP Server running!")
})