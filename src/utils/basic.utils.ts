import { Transaction } from '../interfaces/transaction.interface';
import { TransactionType } from '../interfaces/transaction-type.interface';
// Trim whitespaces from the input string and return the trimmed result
export const trim = (str: string): string => {
    return String(str).trim();
}

// Define the different types of transactions as constants
const transactionType: TransactionType = {
    ORDER: 'order',   // Represents an order transaction
    REFUND: 'refund'   // Represents a refund transaction
};

// Compute the total remaining stock quantity after processing transactions
export const computeTotal = (transactions: Transaction[], stockQty: number): number => {
    // Calculate the total quantity of orders and refunds from the transactions
    const totalOrders = transactions.reduce((total: number, transaction: Transaction) => {
        // If the transaction is an order, add the quantity; if it's a refund, subtract the quantity
        if (transaction.type === transactionType.ORDER) {
            return total + transaction.qty;    // Add quantity for orders
        } else {
            return total - transaction.qty;    // Subtract quantity for refunds
        }
    }, 0);

    // Return the remaining stock quantity by subtracting total orders from the initial stock quantity
    return stockQty - totalOrders;
};

// Export the trim and computeTotal functions for use in other modules
module.exports = { trim, computeTotal };