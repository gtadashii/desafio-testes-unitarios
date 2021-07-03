import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("Should be able to create a new deposit", async () => {
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

    const response = await createStatementUseCase.execute(deposit);

    expect(response).toHaveProperty("id");
  });

  it("Should be able to create a new withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user1@test.com",
      password: "12345"
    });

    const deposit = {
      user_id: user.id,
      type: "deposit",
      amount: 100,
      description: "description"
    } as ICreateStatementDTO

    await createStatementUseCase.execute(deposit)

    const withdraw = {
      user_id: user.id,
      type: "withdraw",
      amount: 50,
      description: "description"
    } as ICreateStatementDTO

    const response = await createStatementUseCase.execute(withdraw)

    expect(response).toHaveProperty("id");

  });

  it("Should not be able to make a withdraw with insufficient balance", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User test",
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

      const withdraw = {
        user_id: user.id,
        type: "withdraw",
        amount: 2000,
        description: "Test Withdraw"
      } as ICreateStatementDTO;

      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(AppError);

  });

  it("Should not be able to make a deposit for a non-existing user", () => {
    expect(async () => {
      const deposit = {
        user_id: "123",
        type: "deposit",
        amount: 1000,
        description: "Test Deposit"
      } as ICreateStatementDTO;

      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to make a withdraw for a non-existing user", () => {
    expect(async () => {
      const withdraw = {
        user_id: "1234",
        type: "deposit",
        amount: 1000,
        description: "Test Deposit"
      } as ICreateStatementDTO;

      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should be able to transfer values between to existing users", async () => {
    const sender_user = await createUserUseCase.execute({
      name: "Sender User",
      email: "sender@test.com",
      password: "12345"
    });

    const receiver_user = await createUserUseCase.execute({
      name: "Receiver User",
      email: "receiver@test.com",
      password: "12345"
    });

    await createStatementUseCase.execute({
      user_id: sender_user.id,
      type: "deposit",
      amount: 1000,
      description: "Test Deposit"
    } as ICreateStatementDTO);

    await createStatementUseCase.execute({
      user_id: receiver_user.id,
      sender_id: sender_user.id,
      type: "transfer",
      amount: 1000,
      description: "Test Transfer"
    } as ICreateStatementDTO);

    const sender_balance = await statementsRepositoryInMemory.getUserBalance({ user_id: sender_user.id as string });

    const receiver_user_balance = await statementsRepositoryInMemory.getUserBalance({ user_id: receiver_user.id as string });

    expect(sender_balance.balance).toEqual(0);
    expect(receiver_user_balance.balance).toEqual(1000);

  });

});