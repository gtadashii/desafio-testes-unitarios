import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create transfer controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to transfer between two existing users", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "user@test.com",
      password: "1234",
    });

    const authSender = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "1234",
    });

    const { token: sender_token } = authSender.body;

    await request(app).post("/api/v1/users").send({
      name: "Test user2",
      email: "user2@test.com",
      password: "1234",
    });

    const authReceiver = await request(app).post("/api/v1/sessions").send({
      email: "user2@test.com",
      password: "1234",
    });

    const { token: receiver_token } = authReceiver.body;

    const receiverId = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${receiver_token}`,
        })
    ).body.id;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${sender_token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/${receiverId}`)
      .send({
        amount: 200,
        description: "Transfer test",
      })
      .set({
        Authorization: `Bearer ${sender_token}`,
      });

    const sender_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${sender_token}`,
      });

    const recipient_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${receiver_token}`,
      });

    expect(sender_balance.body).toHaveProperty("balance", 200);
    expect(recipient_balance.body).toHaveProperty("balance", 0);

  });
});