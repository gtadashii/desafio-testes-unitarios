import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get statement operation by id", async () => {

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

    const statement = {
      amount: 100,
      description: "Deposit test",
    }

    const statementMade = await request(app)
      .post("/api/v1/statements/deposit")
      .send(statement)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = statementMade.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.body).toHaveProperty("description", statement.description);

  });

  it("Should be able to get statement from unexisting user", async () => {

    const token = "tokentest";

    const statement_id = "1234567";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(401);

  });

  it("Should not be able to get info from unexisting statement", async () => {

    await request(app).post("/api/v1/users").send({
      name: "Test user2",
      email: "user2@test.com",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user2@test.com",
      password: "1234",
    });

    const { token } = auth.body;

    const statement_id = "338cd5e290807fd304c6b635e7cb0c5d";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);

  });
});