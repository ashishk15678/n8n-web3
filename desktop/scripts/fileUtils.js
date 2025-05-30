import { promises as fs } from "fs";
import path from "path";

/**
 * Creates a new file with the given content
 * @param {string} filePath - Path where the file should be created
 * @param {string} content - Content to write to the file
 * @returns {Promise<void>}
 */
export async function createFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, "utf8");
    console.log(`File created successfully at: ${filePath}`);
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
}

/**
 * Reads content from a file
 * @param {string} filePath - Path of the file to read
 * @returns {Promise<string>} Content of the file
 */
export async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

/**
 * Appends content to an existing file
 * @param {string} filePath - Path of the file to append to
 * @param {string} content - Content to append
 * @returns {Promise<void>}
 */
export async function appendToFile(filePath, content) {
  try {
    await fs.appendFile(filePath, content, "utf8");
    console.log(`Content appended successfully to: ${filePath}`);
  } catch (error) {
    console.error("Error appending to file:", error);
    throw error;
  }
}
