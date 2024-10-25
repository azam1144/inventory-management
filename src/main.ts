import readline from 'readline';
import { GetStockLevel } from './controllers/stockController';
import { Transaction } from './interfaces/transaction.interface';

// Create an interface for reading input and output streams(terminal)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Fetch the current stock level for a given SKU
const currentStock = async (sku: string): Promise<Transaction> => GetStockLevel(sku);

// Process user input to fetch and display stock level
function processUserInput(input: string): void {
    currentStock(input)  // Call currentStock to get stock level for the input SKU
        .then((stockLevel: Transaction) => {
            console.log(`Total stock for SKU "${input}": ${stockLevel.qty}`);
            takeInput();  // Prompt for the next input
        })
        .catch((error: Error) => {
            console.log(error.message);
            takeInput();  // Prompt for the next input
        });
}

// Prompt the user for input
function takeInput() {
    rl.question('Enter the stock SKU: ', (input) => {
        if (input === '') prompt();  // If input is empty, call prompt function
        else processUserInput(String(input).trim());  // Process the trimmed input
    });
}

// Handle SIGINT (Ctrl+C) signal to prompt for exit confirmation
rl.on('SIGINT', () => {
    prompt();
});

// Prompt the user for confirmation to exit the application
function prompt() {
    rl.question('Are you sure you want to exit? ', (answer) => {
        if (answer.match(/^y(es)?$/i)) {
            rl.close();  // Close the readline interface if the answer is yes
        } else {
            takeInput();  // If the answer is no, prompt for input again
        }
    });
}

// Start the input prompt for the first time
takeInput();