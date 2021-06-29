import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create statement Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to deposit", async () => {
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

    const deposit = {
      amount: 100,
      description: "Deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("description", deposit.description);
    expect(response.body).toHaveProperty("amount", deposit.amount);

  });

  it("Should be able to withdraw", async () => {
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

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("balance", 0);

  });

  it("Should not be able to withdraw from an account without credit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User2 test",
      email: "user2@test.com",
      password: "password",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user2@test.com",
      password: "password",
    });

    const { token } = auth.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "Withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });


});