import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance Controller", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get balance of an user", async () => {

    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "user@test.com",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "1234",
    });

    const { token } = auth.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("balance", 0);

  });

  it("Should not be able to get balance of a non-existing user", async () => {

    const token = "testtoken";

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);

  });

});