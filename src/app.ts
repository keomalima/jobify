import Fastify from "fastify";

import { offerRoutes } from "./modules/offer/offer.route.js";

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import prismaPlugin from "./plugins/prisma.plugin.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await prismaPlugin(app);

  app.register(offerRoutes, { prefix: "/api/offers" });

  return app;
}
