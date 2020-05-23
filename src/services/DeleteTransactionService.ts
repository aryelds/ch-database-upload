import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<boolean> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const idExists = await transactionRepository.findOne({
      where: { id },
    });

    if (!idExists) {
      throw new AppError('ID doesn´t exist');
    }

    const deleteTransaction = await transactionRepository.delete(id);

    return deleteTransaction.affected === 1;
  }
}

export default DeleteTransactionService;
