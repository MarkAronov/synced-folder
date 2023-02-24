/* eslint-disable no-console */
const express = require('express');
const chokidar = require('chokidar');
const path = require('path');
const ioc = require('socket.io-client');

const router = express.Router();
const fs = require('fs');
const io = require('socket.io')({
  cors: {
    origin: '*',
    methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
});

const socketapi = {
  io,
};

const partners = {};
const potentialPartners = {};
const sharesPartnerWise = {};
const sharesFolderWise = {};
const watcher = chokidar.watch([], {
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
});
let frontendSocket = null;
const currentlyBannedItems = [];
const tempBannedUsers = [];
watcher
  .on('add', async (cPath) => {
    if (currentlyBannedItems.includes(cPath)) {
      currentlyBannedItems.splice(currentlyBannedItems.indexOf(cPath), 1);
    } else {
      console.log(`File ${cPath} has been added`);
      fs.readFile(cPath, (err, data) => {
        if (err) throw err;
        let watchedFolderPartners = [];
        let watchedFolder = '';

        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(sharesFolderWise)) {
          if (cPath.includes(key)) {
            watchedFolder = key;
            watchedFolderPartners = sharesFolderWise[key];
          }
        }
        for (let i = 0; i < watchedFolderPartners.length; i++) {
          if (!tempBannedUsers.includes(watchedFolderPartners[i])) {
            partners[watchedFolderPartners[i]].emit('add-file', {
              buffer: data,
              folder: path.basename(watchedFolder),
              filePath: cPath.replace(`${watchedFolder}\\`, ''),
            });
          }
        }
      });
    }
  })
  .on('change', async (cPath) => {
    if (currentlyBannedItems.includes(cPath)) {
      currentlyBannedItems.splice(currentlyBannedItems.indexOf(cPath), 1);
    } else {
      console.log(`File ${cPath} has been changed`);
      fs.readFile(cPath, (err, data) => {
        if (err) throw err;

        let watchedFolderPartners = [];
        let watchedFolder = '';

        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(sharesFolderWise)) {
          if (cPath.includes(key)) {
            watchedFolder = key;
            watchedFolderPartners = sharesFolderWise[key];
          }
        }
        for (let i = 0; i < watchedFolderPartners.length; i++) {
          if (!tempBannedUsers.includes(watchedFolderPartners[i])) {
            partners[watchedFolderPartners[i]].emit('change-file', {
              buffer: data,
              folder: path.basename(watchedFolder),
              filePath: cPath.replace(`${watchedFolder}\\`, ''),
            });
          }
        }
      });
    }
  })
  .on('unlink', async (cPath) => {
    if (currentlyBannedItems.includes(cPath)) {
      currentlyBannedItems.splice(currentlyBannedItems.indexOf(cPath), 1);
    } else {
      console.log(`File ${cPath} has been removed`);
      let watchedFolderPartners = [];
      let watchedFolder = '';

      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }
      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (!tempBannedUsers.includes(watchedFolderPartners[i])) {
          partners[watchedFolderPartners[i]].emit('remove-file', {
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    }
  })
  .on('addDir', (cPath) => {
    if (currentlyBannedItems.includes(cPath)) {
      currentlyBannedItems.splice(currentlyBannedItems.indexOf(cPath), 1);
    } else if (!Object.keys(sharesFolderWise).includes(cPath)) {
      console.log(`Directory ${cPath} has been added`);
      let watchedFolderPartners = [];
      let watchedFolder = '';

      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }
      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (!tempBannedUsers.includes(watchedFolderPartners[i])) {
          partners[watchedFolderPartners[i]].emit('add-directory', {
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    }
  })
  .on('unlinkDir', (cPath) => {
    if (currentlyBannedItems.includes(cPath)) {
      currentlyBannedItems.splice(currentlyBannedItems.indexOf(cPath), 1);
    } else {
      console.log(`Directory ${cPath} has been removed`);
      let watchedFolderPartners = [];
      let watchedFolder = '';

      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }
      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (!tempBannedUsers.includes(watchedFolderPartners[i])) {
          partners[watchedFolderPartners[i]].emit('remove-directory', {
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    }
  });

/// //////////////////////////////////////
// const folder = 'C:\\Users\\asda\\Desktop\\New2\\New1';
// const partnerIp = 'http://localhost:9000';

// const p = ioc(partnerIp, {
//   reconnection: true,
//   reconnectionDelay: 500,
//   transports: ['websocket'],
//   extraHeaders: {
//     'frontend-header': 'frontend',
//   },
// });
// partners[partnerIp] = p;
// sharesPartnerWise[partnerIp] = {};
// sharesPartnerWise[partnerIp].New1 = folder;
// sharesFolderWise[folder] = [partnerIp];
// watcher.add(folder);

// p.on('connect', () => {
//   console.log('Connected to server!');
// });

// const folder = 'C:\\Users\\asda\\Desktop\\New1';
// const partnerIp = 'http://localhost:9001';

// const p = ioc(partnerIp, {
//   reconnection: true,
//   reconnectionDelay: 500,
//   transports: ['websocket'],
//   extraHeaders: {
//     'frontend-header': 'frontend',
//   },
// });
// partners[partnerIp] = p;
// sharesPartnerWise[partnerIp] = {};
// sharesPartnerWise[partnerIp].New1 = folder;
// sharesFolderWise[folder] = [partnerIp];
// watcher.add(folder);

// p.on('connect', () => {
//   console.log('Connected to server!');
// });
// console.log(`being watched: ${Object.keys(watcher.getWatched())}`);

/// ////////////////////////////////////

io.on('connection', function (socket) {
  const localIpAddress =
    socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  if (socket.id === io.engine.id) {
    socket.disconnect();
    return;
  }

  if (localIpAddress === '::1' && !frontendSocket) {
    frontendSocket = socket;
  }
  // const partnerIp = localIpAddress.split(':').pop();

  console.log('connected:', localIpAddress);

  socket.on('remove-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    currentlyBannedItems.push(totalPath);
    // tempBannedUsers.push(partnerIp);
    fs.access(totalPath, fs.constants.F_OK, (err) => {
      fs.unlink(totalPath, (errFile) => {
        if (errFile) {
          return;
        }
        console.log(`File ${totalPath} has been removed`);
      });
    });
  });

  socket.on('remove-directory', async (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    currentlyBannedItems.push(totalPath);
    // tempBannedUsers.push(partnerIp);
    await fs.rmSync(totalPath, { recursive: true, force: true });
    console.log(`Folder ${totalPath} has been removed`);
  });

  socket.on('add-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;

    currentlyBannedItems.push(totalPath);
    // tempBannedUsers.push(partnerIp);
    fs.access(totalPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist, create it
        fs.writeFile(totalPath, arg.buffer, (errFile) => {
          if (errFile) {
            return;
          }
          console.log(`File ${totalPath} has been added`);
        });
      }
    });
  });

  socket.on('change-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    currentlyBannedItems.push(totalPath);

    fs.access(totalPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist, create it
        fs.writeFile(totalPath, arg.buffer, (errFile) => {
          if (errFile) {
            return;
          }
          console.log(`File ${totalPath} has been added`);
        });
      } else {
        fs.unlink(totalPath, (errFile) => {
          if (errFile) {
            return;
          }
          fs.writeFile(totalPath, arg.buffer, (errFileWrite) => {
            if (errFileWrite) {
              return;
            }
            console.log(`File ${totalPath} has been changed`);
          });
        });
      }
    });
  });

  socket.on('add-directory', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    currentlyBannedItems.push(totalPath);
    // tempBannedUsers.push(partnerIp);
    fs.mkdir(totalPath, (errFile) => {
      if (errFile) {
        return;
      }
      console.log(`Folder ${totalPath} has been added`);
    });
  });

  /// ////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on('frontend-get-partners', () => {
    console.log('frontend-get-partners', Object.keys(partners));
    socket.emit('backend-get-partners', Object.keys(partners));
  });

  socket.on('frontend-send-partner-folder-share', (arg) => {
    console.log('frontend-send-partner-folder-share', arg);
    if (!(arg.selectedParter in sharesPartnerWise)) {
      sharesPartnerWise[arg.selectedParter] = {};
    }
    if (
      !(
        path.basename(arg.folderString) in sharesPartnerWise[arg.selectedParter]
      )
    ) {
      sharesPartnerWise[arg.selectedParter][path.basename(arg.folderString)] =
        arg.folderString;
      partners[arg.selectedParter].emit(
        'backend-send-partner-folder-share',
        path.basename(arg.folderString)
      );
      if (!(arg.folderString in sharesFolderWise)) {
        sharesFolderWise[arg.folderString] = [];
      }
      sharesFolderWise[arg.folderString].push(arg.selectedParter);
    }
  });

  socket.on('backend-send-partner-folder-share', (arg) => {
    console.log('backend-send-partner-folder-share', arg);

    frontendSocket.emit('backend-pick-shared-folder-location', {
      folder: arg,
      selectedParter: partnerIp,
    });
  });

  socket.on('frontend-picked-shared-folder-location', (arg) => {
    console.log('frontend-picked-shared-folder-location', arg);

    if (!(arg.selectedParter in sharesPartnerWise)) {
      sharesPartnerWise[arg.selectedParter] = {};
    }
    if (!(arg.folder in sharesPartnerWise[arg.selectedParter])) {
      const fullFolderString = `${arg.folderPathString}\\${arg.folder}`;
      console.log(fullFolderString);
      if (!fs.existsSync(fullFolderString)) {
        fs.mkdirSync(fullFolderString);
      }
      sharesPartnerWise[arg.selectedParter][arg.folder] = fullFolderString;

      partners[arg.selectedParter].emit(
        'backend-starts-sync-with-partner',
        arg.folder
      );
      if (!(fullFolderString in sharesFolderWise)) {
        sharesFolderWise[fullFolderString] = [];
      }
      sharesFolderWise[fullFolderString].push(arg.selectedParter);
      watcher.add(fullFolderString);
    }
  });

  socket.on('backend-starts-sync-with-partner', (msg) => {
    console.log('backend-starts-sync-with-partner');

    watcher.add(sharesPartnerWise[partnerIp][msg]);
  });

  /// /////////////////////////////////////////////////////////

  socket.on('frontend-send-partner-request', async (msg) => {
    const partnerIp = msg.split(':')[0];
    if (partners[partnerIp] === undefined) {
      console.log('frontend-send-partner-request', msg);
      let psocket = '';
      try {
        psocket = ioc(`http://${msg}`, {
          reconnection: true,
          reconnectionDelay: 500,
          transports: ['websocket'],
          extraHeaders: {
            'frontend-header': 'frontend',
          },
        });
      } catch (error) {
        console.error(`Error connecting to  server: ${error}`);
      }

      potentialPartners[partnerIp] = psocket;
      psocket.emit('backend-send-partner-request');
    }
  });

  socket.on('backend-send-partner-request', () => {
    if (partners[partnerIp] === undefined) {
      console.log(`backend-send-partner-request`, localIpAddress);
      if (socket.handshake.address !== '::1') {
        let psocket = '';
        try {
          psocket = ioc(`http://${partnerIp}:9000`, {
            reconnection: true,
            reconnectionDelay: 500,
            transports: ['websocket'],
            extraHeaders: {
              'frontend-header': 'frontend',
            },
          });
        } catch (error) {
          console.error(`Error connecting to  server: ${error}`);
        }

        psocket.emit('backend-confirm-partner-request');
        partners[partnerIp] = psocket;
        frontendSocket.emit('backend-get-partners', Object.keys(partners));
      }
    }
  });

  socket.on('backend-confirm-partner-request', () => {
    partners[partnerIp] = potentialPartners[partnerIp];
    delete potentialPartners[partnerIp];
    frontendSocket.emit('backend-get-partners', Object.keys(partners));
    console.log('backend-confirm-partner-request', partnerIp);
  });
});

module.exports = { router, socketapi };
