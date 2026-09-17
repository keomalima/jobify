// =====================
// Public Routes (No Authentication)
// =====================

import type { FastifyInstance } from "fastify";
import { userSchemas } from "./user.schema.js";
import { userController } from "./user.controller.js";

export async function userPublicRoutes(server: FastifyInstance) {
  server.post("/", {
    schema: {
      body: userSchemas.request.createUser,
      response: { 201: userSchemas.response.createUser },
      description: "Creates a new user",
    },
    handler: userController.createUserHandler,
  });
}
