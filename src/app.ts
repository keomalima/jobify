import "dotenv/config";
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
import { userController } from "./modules/user/user.controller.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.trim() === "") {
    throw new Error("JWT_SECRET is required");
  }

  app.register(fastifyJwt, {
    secret: jwtSecret,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await prismaPlugin(app);

  app.register(userPublicRoutes, { prefix: "/api" });
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", userController.authenticateHandler);
    protectedRoutes.register(offerRoutes, { prefix: "/api/offers" });
    protectedRoutes.register(companyRoutes, { prefix: "/api/companies" });
  });
  return app;
}
