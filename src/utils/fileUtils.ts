import * as fs from 'fs';

// Read a JSON file and parse its content
export const readJsonFile = async (filename: string): Promise<any> => new Promise(async (resolve, reject) => {
    try {
        // Validate the file before reading
        const validateStatus: Boolean | Error = await validateFile(filename);
        if (validateStatus instanceof Error) {
            throw validateStatus;  // Throw error if validation fails
        } else {
            // Read the file and parse its JSON content
            fs.readFile(filename, 'utf8', async (err, data) => {
                if (err) reject(err);  // Reject promise on read error
                else resolve(JSON.parse(data));  // Resolve with parsed JSON data
            });
        }
    } catch (error) {
        reject(new Error((error as Error).message));  // Reject with error message
    }
});

// Validate the file: check if it exists, is not empty, and is valid JSON
export const validateFile = async (filePath: string): Promise<Boolean | Error> => {
    try {
        // Check if the file exists
        const fileExistStatus: Boolean | Error = await fileExists(filePath);
        if (fileExistStatus instanceof Error) {
            throw new Error((fileExistStatus as Error).message);  // Throw error if file does not exist
        }

        // Check if the file is empty
        const fileEmptyStatus: Boolean | Error = await isEmpty(filePath);
        if (fileEmptyStatus instanceof Error) {
            throw new Error((fileEmptyStatus as Error).message);  // Throw error if file is empty
        }

        // Check if the file contains valid JSON
        const validJsonStatus: Boolean | Error = await isValidJson(filePath);
        if (validJsonStatus instanceof Error) {
            throw new Error((validJsonStatus as Error).message);  // Throw error if JSON is invalid
        }

        return true;  // Return true if all validations pass
    } catch (error) {
        throw new Error((error as Error).message);  // Propagate error message
    }
}

// Check if a file exists at the given path
export const fileExists = async (filePath: string): Promise<Boolean | Error> => {
    return new Promise<Boolean | Error>((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                reject(new Error('ENOENT: no such file or directory'));  // Reject if file does not exist
            } else {
                resolve(true);  // Resolve if file exists
            }
        });
    });
};

// Check if a file is empty (0 bytes or only whitespace)
export const isEmpty = async (filePath: string, ignoreWhitespace = true): Promise<Boolean | Error> => {
    return new Promise<Boolean | Error>((resolve, reject) => {
        const stats = fs.statSync(filePath);  // Retrieve file statistics
        const status: boolean = (ignoreWhitespace && stats.size == 0) || (ignoreWhitespace && !!String(stats).match(/^\s*$/));

        if (status) {
            reject(new Error('ENOENT: no content'));  // Reject if file is empty
        } else {
            resolve(false);  // Resolve if file is not empty
        }
    });
}

// Validate if the file contains valid JSON
export const isValidJson = async (filePath: any): Promise<Boolean | Error> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);  // Reject if there's an error reading the file
            } else {
                try {
                    if (JSON.parse(data)) {
                        resolve(true);  // Resolve if JSON is valid
                    }
                } catch (error) {
                    reject(new Error(`Unexpected token in JSON`));  // Reject if JSON is invalid
                }
            }
        });
    });
}

// Export utility functions for file operations
module.exports = { readJsonFile, fileExists, isEmpty, isValidJson, validateFile };