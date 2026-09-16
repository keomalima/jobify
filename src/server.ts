import Fastify from "fastify";

import { offerRoutes } from "./modules/offer/offer.route.js";

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import prismaPlugin from "./plugins/prisma.plugin.js";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
await prismaPlugin(fastify);

fastify.register(offerRoutes, { prefix: "/api/offers" });

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
