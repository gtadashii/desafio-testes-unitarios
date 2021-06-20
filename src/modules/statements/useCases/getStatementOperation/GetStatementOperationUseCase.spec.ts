import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeAll(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(userRepositoryInMemory, statementsRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(userRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("Should be able to get statement operation", async () => {
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

    const statement = await createStatementUseCase.execute(deposit);

    const response = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: statement.id as string });

    expect(response).toHaveProperty("id");
    expect(response.user_id).toEqual(deposit.user_id);

  });

  it("Should not be able to get statement from a non-existing user", () => {
    expect(async () => {
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

      const statement = await createStatementUseCase.execute(deposit);

      await getStatementOperationUseCase.execute({ user_id: "non-existing", statement_id: statement.id as string });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to get a non-existing statement", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com.br",
        password: "1234"
      });

      await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: "non-existing" });
    }).rejects.toBeInstanceOf(AppError);
  });

});