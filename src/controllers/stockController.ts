import { GetStock } from '../services/stock.service';
import { computeTotal, trim } from '../utils/basic.utils';
import { StockItem } from '../interfaces/stock.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { GetTransactions } from '../services/transaction.service';

export const GetStockLevel = async (sku: string): Promise<Transaction> => {
    try {
        // Fetch the stock information for the given SKU
        const stock: StockItem = await GetStock(trim(sku));

        // Fetch the list of transactions for the given SKU
        const transactions: Transaction[] = await GetTransactions(trim(sku));

        // Check if the stock does not exist and there are no transactions; throw an error if both conditions are met
        if (!stock.exist && transactions.length === 0) {
            throw new Error(`Invalid sku "${sku}"`);
        }

        // Return an object containing the SKU and the computed total quantity
        return { sku, qty: computeTotal(transactions, stock.stock) };
    } catch (err) {
        // Rethrow the error with the original message
        throw new Error((err as Error).message);
    }
}

// Export the GetStockLevel function for use in other modules
module.exports = { GetStockLevel };