import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show user profile Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to display an user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Profile Test",
      email: "profile@test.com",
      password: "1234"
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "profile@test.com",
      password: "1234"
    });

    const { token } = auth.body;

    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to display non-existing user", async () => {

    const token = "testtoken";

    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(401);
  });

});