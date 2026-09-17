import Fastify from "fastify";

import { offerRoutes } from "./modules/offer/offer.route.js";

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import prismaPlugin from "./plugins/prisma.plugin.js";
import { companyRoutes } from "./modules/company/company.route.js";
import { userPublicRoutes } from "./modules/user/user.route.js";
import fastifyJwt from "@fastify/jwt";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.register(fastifyJwt, {
    secret: "supersecret",
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await prismaPlugin(app);

  app.register(offerRoutes, { prefix: "/api/offers" });
  app.register(companyRoutes, { prefix: "/api/companies" });
  app.register(userPublicRoutes, { prefix: "/api" });

  return app;
}
