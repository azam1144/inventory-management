import * as path from 'path';
import { readJsonFile } from '../utils/fileUtils';
import { Transaction } from '../interfaces/transaction.interface';

export const GetTransactions = async (sku: string): Promise<Transaction[]> => {
    // Read the transactions data from a JSON file
    const transactionList = await readJsonFile(path.resolve(__dirname, '../mockups/transactions.json'));

    // Filter the transaction list to return only the transactions that match the given SKU
    return transactionList.filter((transaction: Transaction) => transaction.sku === sku);
};

// Export the GetTransactions function for use in other modules
module.exports = { GetTransactions };
