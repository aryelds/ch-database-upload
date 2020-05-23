import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type!');
    }

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (value > total && type === 'outcome') {
      throw new AppError('Not enough balance');
    }

    const categoryRepository = getRepository(Category);

    let category_id = null;

    const categoryTitle = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryTitle) {
      const newCategory = await categoryRepository.create({
        title: category,
      });

      const categoryEntity = await categoryRepository.save(newCategory);
      category_id = categoryEntity.id;
    } else {
      category_id = categoryTitle.id;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    const newTransaction = await transactionRepository.save(transaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
