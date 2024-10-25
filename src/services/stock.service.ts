import * as path from 'path';
import { readJsonFile } from '../utils/fileUtils';
import { StockItem } from '../interfaces/stock.interface';

export const GetStock = async (sku: string): Promise<StockItem> => {
    // Read the stock data from a JSON file
    const stockListResponse = await readJsonFile(path.resolve(__dirname, '../mockups/stock.json'));

    // Find the stock item that matches the given SKU
    const stock = stockListResponse.find((item: StockItem) => item.sku === sku);

    // If the stock item exists, return it with an 'exist' property set to true
    if (stock) return { ...stock, exist: true };

    // If the stock item does not exist, return a default object with stock set to 0 and 'exist' as false
    return { sku: sku, stock: 0, exist: false };
};

// Export the GetStock function for use in other modules
module.exports = { GetStock };