import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

  beforeAll(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to create an user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com.br",
      password: "1234"
    });

    expect(user).toHaveProperty("id");

  });

  it("Should not be able to create user with existing email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com.br",
        password: "1234"
      });

      await createUserUseCase.execute({
        name: "User Test 2",
        email: "user@test.com.br",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})