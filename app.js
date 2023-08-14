const fs = require('fs/promises');

//Commands:
const CREATE_FILE = 'create a file';
const DELETE_FILE = 'delete the file';
const RENAME_FILE = 'rename the file';
const ADD_TO_FILE = 'add to the file';

const createFile = async (filePath) => {
  try {
    // chack if the file exist
    const existingFileHandle = await fs.open(filePath, 'r');
    existingFileHandle.close();

    return console.log(`The file ${filePath} is already exist.`);
  } catch (error) {
    //if the file don't exist, create new file.
    const newFileHandle = await fs.open(filePath, 'w');
    console.log('A new file was successfully created.');
    newFileHandle.close();
  }
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log('File deleted successfully!');
  } catch (error) {
    // error: duplicate save in visual studio
    if (error.code === 'ENOENT') {
      console.log('file not found.');
    } else {
      console.log(error);
    }
  }
};

const renameFile = async (filePath, newPath) => {
  try {
    await fs.rename(filePath, newPath);
    console.log('Rename file successfully!');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('file not found.');
    } else {
      console.log(error);
    }
  }
};

let contentCheck;

const addToFile = async (filePath, content) => {
  if (content === contentCheck) return;
  try {
    // a flag append to the file
    const fileHandler = await fs.open(filePath, 'a');
    fileHandler.write(content);
    contentCheck = content;
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  // open file
  const commandFileHandler = await fs.open('command.txt', 'r');

  //  **fileHandler class extends from EventEmitter class
  commandFileHandler.on('change', async () => {
    // get the file size for allocating the buffer
    const dataFile = await commandFileHandler.stat();
    const fileSize = dataFile.size;
    // allocate the buffer with the size of the file
    const buffer = Buffer.alloc(fileSize);

    // the location at which i want to start filling the buffer
    const offset = 0;
    // how many bytes i want to read from the file
    const length = buffer.byteLength;
    // the position that i want to start reading the file from
    const position = 0;

    //read the whole content from start to end and fill the buffer
    await commandFileHandler.read(buffer, offset, length, position);
    const command = buffer.toString('utf-8');

    let filePath = null;
    //Create a file:
    //create a file <filePath>
    if (command.includes(CREATE_FILE)) {
      filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    //Delete a file:
    // delete the file <filePath>
    if (command.includes(DELETE_FILE)) {
      filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    //Rename a file:
    //rename the file <filePath> to <newPath>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(' to ');
      filePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newPath = command.substring(_idx + 4);
      renameFile(filePath, newPath);
    }

    //Add to the file:
    //add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(' this content: ');
      filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);
      addToFile(filePath, content);
    }
  });

  // watcher
  const watcher = fs.watch('./command.txt');

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      // file change
      commandFileHandler.emit('change');
      console.log('The file was changed!');
    }
  }
})();
