/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

export class fileutil {
  public static readFilesSync(dir: string): File[] {
    const files: File[] = [];
    fs.readdirSync(dir).forEach((filename) => {
      const name = path.parse(filename).name;
      const ext = path.parse(filename).ext;
      const filepath = path.resolve(dir, filename);
      const stat = fs.statSync(filepath);
      const isFile = stat.isFile();

      if (isFile) files.push(new File(name, filepath, ext));
    });
    return files;
  }

  public static readAllFiles(
    dirPath: string,
    fileMap: Map<string, File[]> = new Map<string, File[]>()
  ): Map<string, File[]> {
    if (!fs.existsSync(dirPath)) {
      console.error(`Directory does not exist: ${dirPath}`);
      return fileMap; // Return the map as is
    }
    // Read the directory contents
    const files = fs.readdirSync(dirPath);

    // Initialize the list of files for the current directory
    const currentDirFiles: File[] = [];

    files.forEach((filename) => {
      // Construct the full file/directory path
      const filePath = path.join(dirPath, filename);

      // Check if the current path is a directory or a file
      if (fs.statSync(filePath).isDirectory()) {
        // If it's a directory, recurse into it
        this.readAllFiles(filePath, fileMap);
      } else {
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        const filepath = path.resolve(dirPath, filename);
        const stat = fs.statSync(filepath);
        const isFile = stat.isFile();

        // If it's a file, add it to the current directory's file list
        if (isFile) {
          currentDirFiles.push(new File(name, filepath, ext));
        }
      }
    });

    // Add the current directory and its files to the map
    if (currentDirFiles.length > 0) {
      fileMap.set(path.basename(dirPath), currentDirFiles);
    }
    return fileMap;
  }

  // Method to save modified HTML back to a file
  public static saveToFile(outputFilePath: string, modifiedHtml: string): void {
    try {
      fs.writeFileSync(outputFilePath, modifiedHtml);
      console.log(`Modified HTML saved to ${outputFilePath}`);
    } catch (error) {
      console.error(`Error writing file to disk: ${error}`);
      throw error;
    }
  }

  public static readAndProcessFiles(
    baseDir: string,
    searchString: string,
    fileMap: Map<string, File[]> = new Map<string, File[]>()
  ): Map<string, File[]> {
    const subDirectories = fs.readdirSync(baseDir).filter((dir) => {
      const fullPath = path.join(baseDir, dir);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const subDirectory of subDirectories) {
      console.log(`Processing subdirectory: ${subDirectory}`);
      const subDirPath = path.join(baseDir, subDirectory);

      // Check the XML file for the substring
      const xmlFilePath = path.join(subDirPath, `${subDirectory}.js-meta.xml`);
      if (fs.existsSync(xmlFilePath)) {
        if (this.doesSubstringExist(xmlFilePath, searchString)) {
          console.log(`Substring found in ${xmlFilePath}. Skipping all files in ${subDirectory}.`);
          continue; // Move to the next subdirectory
        }
      }

      // Process all files if substring is not found
      const currentDirFiles: File[] = [];
      const files = fs
        .readdirSync(subDirPath)
        .filter((file) => file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.xml'));
      files.forEach((file) => {
        const filePath = path.join(subDirPath, file);
        console.log(`Processing file: ${filePath}`);
        const name = path.parse(file).name;
        const ext = path.parse(file).ext;
        const filepath = path.resolve(subDirPath, file);
        currentDirFiles.push(new File(name, filepath, ext));
        fileMap.set(path.basename(subDirPath), currentDirFiles);
      });
    }
    return fileMap;
  }

  /**
   * Check if a substring exists in an XML file
   *
   * @param filePath Path of the XML file
   * @param searchString Substring to search for
   * @returns true if substring exists, otherwise false
   */
  private static doesSubstringExist = (filePath: string, searchString: string): boolean => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return fileContent.includes(searchString);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return false;
    }
  };
}

export class File {
  public name: string;
  public location: string;
  public ext: string;
  public constructor(name: string, location: string, ext: string) {
    this.name = name;
    this.location = location;
    this.ext = ext;
  }
}
