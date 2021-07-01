import { getRepository, Repository } from "typeorm";
import { ICreateTransferDTO } from "../dto/ICreateTransferDTO";
import { Transfer } from "../entities/Transfer";
import { ITransfersRepository } from "./ITransfersRepository";

class TransfersRepository implements ITransfersRepository {

  private repository: Repository<Transfer>;

  constructor() {
    this.repository = getRepository(Transfer);
  }

  async create({
    sender_id,
    amount,
    description,
    type,
    created_at,
    updated_at,
    id }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = this.repository.create({
      sender_id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      id
    });

    await this.repository.save(transfer);
    return transfer;
  }

}

export { TransfersRepository }