import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/order";
import { amqpListener } from "./rabbitmq";
import { appLoadBalancer } from "../load-balancer";

//ECS + Fargate (Serviço da AWS que recebe um docker e sobe a aplicação) -> Deploy
// 1/4 vCPU + 512RAM => $17 (Sem configurações)
// SPOT INSTANCES "usar maquinas já pagas que não estão em uso" -> poupa de 50% a 70% do valor

const ordersTargetGroup = appLoadBalancer.createTargetGroup("orders-target", {
  port: 3333,
  protocol: "HTTP",
  healthCheck: {
    path: "/health",
    protocol: "HTTP",
  },
});

export const ordersHttpListener = appLoadBalancer.createListener(
  "orders-listener",
  {
    port: 3333,
    protocol: "HTTP",
    targetGroup: ordersTargetGroup,
  }
);

export const ordersService = new awsx.classic.ecs.FargateService(
  "fargate-orders",
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      container: {
        image: ordersDockerImage.ref,
        cpu: 256,
        memory: 512,
        portMappings: [ordersHttpListener],
        environment: [
          {
            name: "BROKER_URL",
            value: pulumi.interpolate`amqp://admin:guest@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
          },
          {
            name: "DATABASE_URL",
            value: "",
          },
          {
            name: "OTEL_SERVICE_NAME",
            value: "orders",
          },
          {
            name: "OTEL_TRACES_EXPORTER",
            value: "otlp",
          },
          {
            name: "OTEL_EXPORTER_OTLP_ENDPOINT",
            value: "https://otlp-gateway-prod-sa-east-1.grafana.net/otlp",
          },
          {
            name: "OTEL_EXPORTER_OTLP_HEADERS",
            value: "",
          },
          {
            name: "OTEL_RESOURCE_ATTRIBUTES",
            value:
              "service.name=orders,service.namespace=eventonodejs,deployment.environment=production",
          },
          {
            name: "OTEL_NODE_RESOURCE_DETECTORS",
            value: "env,host,os",
          },
          {
            name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS",
            value: "http,fastify,pg,amqplib",
          },
        ],
      },
    },
  }
);
