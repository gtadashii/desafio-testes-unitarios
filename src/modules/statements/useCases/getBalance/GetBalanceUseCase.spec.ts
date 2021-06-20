import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;


describe("Get Balance", () => {

  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
  });

  it("Should be able to get the balance of an user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com.br",
      password: "1234"
    });

    const deposit = {
      user_id: user.id,
      type: "deposit",
      amount: 1000,
      description: "Test Deposit"
    } as ICreateStatementDTO;

    await createStatementUseCase.execute(deposit);

    const response = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(response).toHaveProperty("balance");
    expect(response.balance).toEqual(deposit.amount);

  });

  it("Should not be possible to get balance of an non-existing user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "non-existing-user" });
    }).rejects.toBeInstanceOf(AppError);
  });
})