import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user controler", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User test",
      email: "user@test.com",
      password: "test"
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user with an existing email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User1",
      email: "user1@test.com",
      password: "test"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "User1",
      email: "user1@test.com",
      password: "test"
    });

    expect(response.status).toBe(400);
  });
});