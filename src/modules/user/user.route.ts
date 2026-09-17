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

  server.post("/login", {
    schema: {
      body: userSchemas.request.login,
      response: { 200: userSchemas.response.login },
      description: "Login user and get access token",
    },
    handler: userController.loginUserHandler,
  });
}
