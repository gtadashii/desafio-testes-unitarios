import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {

  beforeAll(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to authenticate", async () => {
    await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com.br",
      password: "1234",
    });

    const response = await authenticateUserUseCase.execute({
      email: "user@test.com.br",
      password: "1234",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("user");

  });

  it("Should not be able to authenticate a non-existing user", async () => {

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "non-existing-user@test.com.br",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);

  });

  it("Should not be able to authenticate user with incorrect pasaword", async () => {

    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com.br",
        password: "1234"
      });

      await authenticateUserUseCase.execute({
        email: "user@test.com.br",
        password: "9999",
      });
    }).rejects.toBeInstanceOf(AppError);

  });

  it("Should not be able to authenticate user with incorrect pasaword", async () => {

    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com.br",
        password: "1234"
      });

      await authenticateUserUseCase.execute({
        email: "incorrect-mail@test.com.br",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);

  });

});