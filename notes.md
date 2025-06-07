# Anotações

- Cada microserviço tem um banco de dados próprio;

### Message Broker - RabbitMQ/Kafka

Sistema de mensageria assicrona.

É um sistema que armazena os eventos emitidos pelos serviços .



Para evitar que uma operação seja processada mais de uma vez em um cenário de falha em algum componente do serviço, utilizamos a propriedade de idempotência.
