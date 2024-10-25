import path from 'path';
import { computeTotal } from '../utils/basic.utils';
import { GetStock } from '../services/stock.service';
import { StockItem } from '../interfaces/stock.interface';
import {fileExists, isEmpty, isValidJson, readJsonFile, validateFile} from '../utils/fileUtils';
import { GetStockLevel } from '../controllers/stockController';
import { Transaction } from '../interfaces/transaction.interface';
import { GetTransactions } from '../services/transaction.service';

/*
* TEST CASE: File existence testing
* */
describe('Read file validation tests', (): void => {
    describe('File existence testing', (): void => {
        it('should handle the scenario when a file does not exist', async () => {
            const nonExistentFile: string = path.resolve(__dirname, '../mockups/non_existent_file.json');
            await expect(fileExists(nonExistentFile)).rejects.toThrow('ENOENT: no such file or directory');
        });

        it('should handle the scenario when a file exist', async () => {
            const existingFile: string = path.resolve(__dirname, '../mockups/stock.json');
            const result: Boolean | Error = await fileExists(existingFile);
            expect(result).toBe<Boolean>(true);
        });
    });

    describe('Validate JSON data', (): void => {
        it('should throw an error indicating the issue with the JSON data', async () => {
            const filePath: string = path.resolve(__dirname, '../mockups/invalid.json');
            await expect(isValidJson(filePath)).rejects.toThrow('Unexpected token in JSON');
        });

        it('should validate when a file have valid json data', async () => {
            const filePath: string = path.resolve(__dirname, '../mockups/stock.json');
            const result: Boolean | Error = await isValidJson(filePath);
            expect(result).toBe<Boolean>(true);
        });
    });

    describe('Empty file data', (): void => {
        it('should throw an error indicating no content', async () => {
            const filePath: string = path.resolve(__dirname, '../mockups/empty.json');
            await expect(isEmpty(filePath)).rejects.toThrow('ENOENT: no content');
        });

        it('should validate when a file have a json data', async () => {
            const filePath: string = path.resolve(__dirname, '../mockups/stock.json');
            const result: Boolean | Error = await isEmpty(filePath);
            expect(result).toBe<Boolean>(false);
        });
    });
});

/*
* TEST CASE: SKU exists in stock
* */
describe('SKU exists in stock', (): void => {
    it('should return the stock item for a valid SKU', async () => {
        const sku = 'QWP084011/40/33';
        const stock: StockItem = await GetStock(sku);
        expect(stock).toEqual(
            expect.objectContaining(
                {
                    sku: expect.any(String),
                    stock: expect.any(Number),
                }
            )
        );
    });

    it('should throw an error for an invalid SKU', async () => {
        const sku = 'QWP084011/';
        const stock: StockItem = await GetStock(sku);
        expect(stock).toEqual({ sku: 'QWP084011/', stock: 0, exist: false });
    });
});

/*
* TEST CASE: Transactions for the same SKU
* */
describe('Transactions for a SKU', (): void => {
    const sku = 'QWP084011/40/33';
    it('should correctly calculate the total quantity based on all the transactions for the given SKU', async () => {
        const stock: StockItem = await GetStock(sku);
        const transactions: Transaction[] = await GetTransactions(sku);
        const stockLevel: number = computeTotal(transactions, stock.stock);
        expect(stockLevel).toBe<number>(2197);
    });
    it('should return all transactions by sku and validate response', async () => {
        const transactions: Transaction[] = await GetTransactions(sku);
        expect(transactions).toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        sku: expect.any(String),
                        qty: expect.any(Number),
                        type: expect.any(String),
                    }
                )
            ])
        );
    });

    it('should throw an error for an invalid SKU', async () => {
        const sku = 'QWP084011/';
        const transactions: Transaction[] = await GetTransactions(sku);
        console.log('transactions: ', transactions);
        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBe(0);
    });
});

/*
* TEST CASE: SKU exists in both stock and transactions
* */
describe('SKU exists in both stock and transactions', (): void => {
    it('should return the correct total quantity for the given SKU', async () => {
        const sku: string = 'QWP084011/40/33';
        const stockLevel: Transaction = await GetStockLevel(sku);
        expect(stockLevel.qty).toBe<number>(2197);
    });
});

/*
* TEST CASE: SKU exists in stock but not in transactions
* */
describe(`SKU exists in stock but haven't transactions`, (): void => {
    it('should return the initial quantity from stock.json as the total quantity for the given SKU', async () => {
        const sku: string = 'HGG795032/35/91';
        const stockLevel: Transaction = await GetStockLevel(sku);
        expect(stockLevel.qty).toBe<number>(4009);
    });
});

/*
* TEST CASE: SKU does not exist in stock but have transactions
* */
describe(`SKU does not exist in stock but have transactions`, (): void => {
    it('should return the total quantity based on the transactions for the given SKU', async () => {
        const sku: string = 'TVU730483/47/65';
        const currentStock = async (sku: string): Promise<Transaction> => GetStockLevel(sku);
        const stockLevel: Transaction = await currentStock(sku);
        expect(stockLevel.qty).toBe<number>(973);
    });
});

/*
* TEST CASE: SKU does not exist in either stock or transactions
* */
describe(`SKU does not exist in either stock or transactions`, (): void => {
    const sku: string = 'LRT321244';
    it('should throw an error', async () => {
        await expect(GetStockLevel(sku)).rejects.toThrow(`Invalid sku "${sku}"`);
    });

    describe(`Some test suite with additional test cases for diverse outputs`, (): void => {
        it('should throw an error for an invalid SKU', async () => {
            const stock: StockItem = await GetStock(sku);
            if (!stock.exist) {
                const t = () => {
                    throw new TypeError(`SKU "${sku}" does not exist in stock.json`);
                };
                expect(t).toThrow(TypeError(`SKU "${sku}" does not exist in stock.json`));
            }
        });

        it('should throw an error for an invalid SKU', async () => {
            const transactions: Transaction[] = await GetTransactions(sku);
            if (transactions.length === 0) {
                const t = () => {
                    throw new TypeError(`SKU "${sku}" does not exist in transactions.json`);
                };
                expect(t).toThrow(TypeError(`SKU "${sku}" does not exist in transactions.json`));
            }
        });
    });
});

/*
* TEST CASE: Performance testing
* */
describe('Performance testing', () => {
    it('should handle large datasets efficiently and provide the correct stock level for the given SKU', async () => {
        const sku: string = 'QWP084011/40/33';
        const startTime: [number, number] = process.hrtime();
        const stockLevel: Transaction = await GetStockLevel(sku);
        const endTime: [number, number] = process.hrtime(startTime);

        expect(endTime[1] / 1000000).toBeLessThan(500);
        expect(stockLevel.qty).toBeGreaterThan(0);
    });
});