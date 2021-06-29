import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a session for a valid user", async () => {

    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@test.com.br",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com.br",
      password: "1234",
    });

    expect(response.body.user).toHaveProperty("email", "user@test.com.br");
    expect(response.body).toHaveProperty("token");
  });
});
