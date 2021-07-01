import { ICreateTransferDTO } from "../dto/ICreateTransferDTO";
import { Transfer } from "../entities/Transfer";

interface ITransfersRepository {
  create(data: ICreateTransferDTO): Promise<Transfer>
};

export { ITransfersRepository };