/* eslint-disable no-useless-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
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

// server data
const partners = {};
const potentialPartners = {};
const sharesPartnerWise = {};
const sharesFolderWise = {};
const folderStructure = {};
const tempBannedUsers = [];
const watcher = chokidar.watch([], {
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
});
let frontendSocket = null;

// main listener of the server, it will see changes and will emit to the needed partners
watcher
  .on('add', async (cPath) => {
    console.log(`File ${cPath} has been added`);
    fs.readFile(cPath, (err, data) => {
      if (err) return;
      let watchedFolderPartners = [];
      let watchedFolder = '';

      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }

      if (
        folderStructure[watchedFolder].every(
          (item) => item.name !== cPath.replace(`${watchedFolder}\\`, '')
        )
      ) {
        folderStructure[watchedFolder] = folderStructure[watchedFolder].concat({
          name: cPath.replace(`${watchedFolder}\\`, ''),
          type: 'file',
        });
      }

      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (tempBannedUsers.includes(watchedFolderPartners[i])) {
          tempBannedUsers.splice(
            tempBannedUsers.indexOf(watchedFolderPartners[i]),
            1
          );
        } else {
          partners[watchedFolderPartners[i]].emit('add-file', {
            buffer: data,
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    });
  })
  .on('change', async (cPath) => {
    console.log(`File ${cPath} has been changed`);
    fs.readFile(cPath, (err, data) => {
      if (err) return;

      let watchedFolderPartners = [];
      let watchedFolder = '';

      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }
      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (tempBannedUsers.includes(watchedFolderPartners[i])) {
          tempBannedUsers.splice(
            tempBannedUsers.indexOf(watchedFolderPartners[i]),
            1
          );
        } else {
          partners[watchedFolderPartners[i]].emit('change-file', {
            buffer: data,
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    });
  })
  .on('unlink', async (cPath) => {
    console.log(`File ${cPath} has been removed`);
    let watchedFolderPartners = [];
    let watchedFolder = '';

    for (const key of Object.keys(sharesFolderWise)) {
      if (cPath.includes(key)) {
        watchedFolder = key;
        watchedFolderPartners = sharesFolderWise[key];
      }
    }
    for (let i = 0; i < folderStructure[watchedFolder].length; i++) {
      if (
        folderStructure[watchedFolder][i].name ===
        cPath.replace(`${watchedFolder}\\`, '')
      ) {
        folderStructure[watchedFolder].splice(i, 1);
      }
    }

    for (let i = 0; i < watchedFolderPartners.length; i++) {
      if (tempBannedUsers.includes(watchedFolderPartners[i])) {
        tempBannedUsers.splice(
          tempBannedUsers.indexOf(watchedFolderPartners[i]),
          1
        );
      } else {
        partners[watchedFolderPartners[i]].emit('remove-file', {
          folder: path.basename(watchedFolder),
          filePath: cPath.replace(`${watchedFolder}\\`, ''),
        });
      }
    }
  })
  .on('addDir', (cPath) => {
    if (!Object.keys(sharesFolderWise).includes(cPath)) {
      console.log(`Directory ${cPath} has been added`);
      let watchedFolderPartners = [];
      let watchedFolder = '';

      for (const key of Object.keys(sharesFolderWise)) {
        if (cPath.includes(key)) {
          watchedFolder = key;
          watchedFolderPartners = sharesFolderWise[key];
        }
      }
      if (
        folderStructure[watchedFolder].every(
          (item) => item.name !== cPath.replace(`${watchedFolder}\\`, '')
        )
      ) {
        folderStructure[watchedFolder] = folderStructure[watchedFolder].concat({
          name: cPath.replace(`${watchedFolder}\\`, ''),
          type: 'folder',
        });
      }

      for (let i = 0; i < watchedFolderPartners.length; i++) {
        if (tempBannedUsers.includes(watchedFolderPartners[i])) {
          tempBannedUsers.splice(
            tempBannedUsers.indexOf(watchedFolderPartners[i]),
            1
          );
        } else {
          partners[watchedFolderPartners[i]].emit('add-directory', {
            folder: path.basename(watchedFolder),
            filePath: cPath.replace(`${watchedFolder}\\`, ''),
          });
        }
      }
    }
  })
  .on('unlinkDir', (cPath) => {
    console.log(`Directory ${cPath} has been removed`);
    let watchedFolderPartners = [];
    let watchedFolder = '';

    for (const key of Object.keys(sharesFolderWise)) {
      if (cPath.includes(key)) {
        watchedFolder = key;
        watchedFolderPartners = sharesFolderWise[key];
      }
    }
    for (let i = 0; i < folderStructure[watchedFolder].length; i++) {
      if (
        folderStructure[watchedFolder][i].name ===
        cPath.replace(`${watchedFolder}\\`, '')
      ) {
        folderStructure[watchedFolder].splice(i, 1);
      }
    }
    for (let i = 0; i < watchedFolderPartners.length; i++) {
      if (tempBannedUsers.includes(watchedFolderPartners[i])) {
        tempBannedUsers.splice(
          tempBannedUsers.indexOf(watchedFolderPartners[i]),
          1
        );
      } else {
        partners[watchedFolderPartners[i]].emit('remove-directory', {
          folder: path.basename(watchedFolder),
          filePath: cPath.replace(`${watchedFolder}\\`, ''),
        });
      }
    }
  });

// the main instance
io.on('connection', function (socket) {
  if (socket.id === io.engine.id) {
    socket.disconnect();
    return;
  }

  // get the local ip address of the sender
  const localIpAddress =
    socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  // save the frontend as soon as possible
  if (localIpAddress === '::1' && !frontendSocket) {
    frontendSocket = socket;
  }
  const partnerIp = localIpAddress.split(':').pop();

  // basic printing of connected clients
  console.log('connected:', partnerIp);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  // add a file
  socket.on('add-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    tempBannedUsers.push(partnerIp);
    fs.access(totalPath, fs.constants.F_OK, (err) => {
      if (err) {
        // if file does not exist, create it
        fs.writeFile(totalPath, arg.buffer, (errFile) => {
          if (errFile) {
            return;
          }
          console.log(`File ${totalPath} has been added`);
        });
      }
    });
  });

  // change a file
  socket.on('change-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    tempBannedUsers.push(partnerIp);
    fs.access(totalPath, fs.constants.F_OK, (err) => {
      if (err) {
        // if file does not exist, create it
        fs.writeFile(totalPath, arg.buffer, (errFile) => {
          if (errFile) {
            return;
          }
          console.log(`File ${totalPath} has been added`);
        });
      }
      // else remove it and write again
      else {
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

  // remove a file
  socket.on('remove-file', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    tempBannedUsers.push(partnerIp);
    fs.access(totalPath, fs.constants.F_OK, (err) => {
      fs.unlink(totalPath, (errFile) => {
        if (errFile) {
          return;
        }
        console.log(`File ${totalPath} has been removed`);
      });
    });
  });

  // add a folder
  socket.on('add-directory', (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    tempBannedUsers.push(partnerIp);
    fs.mkdir(totalPath, (errFile) => {
      if (errFile) {
        return;
      }
      console.log(`Folder ${totalPath} has been added`);
    });
  });

  // remove a folder and it's content
  socket.on('remove-directory', async (arg) => {
    const totalPath = `${sharesPartnerWise[partnerIp][arg.folder]}\\${
      arg.filePath
    }`;
    tempBannedUsers.push(partnerIp);
    await fs.rmSync(totalPath, { recursive: true, force: true });
    console.log(`Folder ${totalPath} has been removed`);
  });

  /// ////////////////////////////////////////////////////////////////////////////////////////////////////

  // listen from the frontend about a share request
  // and then send the request to the partner
  // also, save the folder
  socket.on('frontend-send-partner-folder-share', (arg) => {
    console.log('frontend-send-partner-folder-share', arg);
    if (!(arg.selectedPartner in sharesPartnerWise)) {
      sharesPartnerWise[arg.selectedPartner] = {};
    }
    if (
      !(
        path.basename(arg.folderString) in
        sharesPartnerWise[arg.selectedPartner]
      )
    ) {
      sharesPartnerWise[arg.selectedPartner][path.basename(arg.folderString)] =
        arg.folderString;
      partners[arg.selectedPartner].emit(
        'backend-send-partner-folder-share',
        path.basename(arg.folderString)
      );
      if (!(arg.folderString in sharesFolderWise)) {
        sharesFolderWise[arg.folderString] = [];
      }
      sharesFolderWise[arg.folderString].push(arg.selectedPartner);
      if (!(arg.folderString in folderStructure)) {
        folderStructure[arg.folderString] = [];
      }
    }
  });

  // listen for syncing requests and then ask the frontend for a directory
  // where the folder will be saved
  socket.on('backend-send-partner-folder-share', (arg) => {
    console.log('backend-send-partner-folder-share', arg);

    frontendSocket.emit('backend-pick-shared-folder-location', {
      folder: arg,
      partner: partnerIp,
    });
  });

  // after the frontend picked the folder start syncing and notify the partner as well
  socket.on('frontend-picked-shared-folder-location', (arg) => {
    console.log('frontend-picked-shared-folder-location', arg);

    if (!(arg.partner in sharesPartnerWise)) {
      sharesPartnerWise[arg.partner] = {};
    }
    if (!(arg.folder in sharesPartnerWise[arg.partner])) {
      const fullFolderString = `${arg.folderPathString}\\${arg.folder}`;
      console.log(fullFolderString);
      if (!fs.existsSync(fullFolderString)) {
        fs.mkdir(fullFolderString, (errFile) => {
          if (errFile) {
            return;
          }
        });
      }
      sharesPartnerWise[arg.partner][arg.folder] = fullFolderString;

      // send a confirm message so that the partner will start syncing as well
      partners[arg.partner].emit(
        'backend-starts-sync-with-partner',
        arg.folder
      );
      if (!(fullFolderString in sharesFolderWise)) {
        sharesFolderWise[fullFolderString] = [];
      }
      sharesFolderWise[fullFolderString].push(arg.partner);
      if (!(fullFolderString in folderStructure)) {
        folderStructure[fullFolderString] = [];
      } else {
        console.log();
        console.log(fullFolderString);
        console.log(fullFolderString[fullFolderString]);
        console.log(fullFolderString);
        console.log();
        for (let i = 0; i < folderStructure[fullFolderString].length; i++) {
          const cPath = `${fullFolderString}\\${folderStructure[fullFolderString][i].name}`;
          if (folderStructure[fullFolderString][i].type === 'file') {
            fs.readFile(cPath, (err, data) => {
              if (err) return;

              partners[arg.partner].emit('add-file', {
                buffer: data,
                folder: arg.folder,
                filePath: folderStructure[fullFolderString][i].name,
              });
            });
          }
          if (folderStructure[fullFolderString][i].type === 'folder') {
            partners[partnerIp].emit('add-directory', {
              folder: arg.folder,
              filePath: folderStructure[fullFolderString][i].name,
            });
          }
        }
      }
      watcher.add(fullFolderString);
    }
  });

  // confirm the handshake and start syncing
  socket.on('backend-starts-sync-with-partner', (msg) => {
    console.log('backend-starts-sync-with-partner');
    const fullFolderString = sharesPartnerWise[partnerIp][msg];
    console.log();
    console.log(fullFolderString);
    console.log(folderStructure);
    console.log(fullFolderString in folderStructure);
    console.log();

    if (
      fullFolderString in folderStructure &&
      folderStructure[fullFolderString].length !== 0
    ) {
      console.log(folderStructure[fullFolderString][0]);
      console.log(folderStructure[fullFolderString][0].name);
      console.log();
      for (let i = 0; i < folderStructure[fullFolderString].length; i++) {
        const cPath = `${fullFolderString}\\${folderStructure[fullFolderString][i].name}`;
        if (folderStructure[fullFolderString][i].type === 'file') {
          fs.readFile(cPath, (err, data) => {
            if (err) return;

            partners[partnerIp].emit('add-file', {
              buffer: data,
              folder: msg,
              filePath: folderStructure[fullFolderString][i].name,
            });
          });
        }
        if (folderStructure[fullFolderString][i].type === 'folder') {
          partners[partnerIp].emit('add-directory', {
            folder: msg,
            filePath: folderStructure[fullFolderString][i].name,
          });
        }
      }
    }
    watcher.add(fullFolderString);
  });

  // remove a specific folder
  socket.on('frontend-remove-partner-folder-share', (arg) => {
    console.log('frontend-remove-partner-folder-share', arg);
    console.log();
    console.log(sharesPartnerWise);
    console.log(sharesFolderWise);
    console.log(folderStructure);
    delete sharesPartnerWise[arg.selectedPartner][
      path.basename(arg.folderString)
    ];
    sharesFolderWise[arg.folderString].splice(
      sharesFolderWise[arg.folderString].indexOf(arg.selectedPartner),
      1
    );
    if (sharesFolderWise[arg.folderString].length === 0) {
      folderStructure[arg.folderString] = [];
      watcher.unwatch(arg.folderString);
    }
    console.log();
    console.log(sharesPartnerWise);
    console.log(sharesFolderWise);
    console.log(folderStructure);
    console.log();

    partners[arg.selectedPartner].emit(
      'backend-remove-partner-folder-share',
      path.basename(arg.folderString)
    );
  });

  socket.on('backend-remove-partner-folder-share', (msg) => {
    console.log('backend-remove-partner-folder-share', msg);

    console.log();
    console.log(sharesPartnerWise);
    console.log(sharesFolderWise);
    console.log(folderStructure);
    const fullFolderString = sharesPartnerWise[partnerIp][msg];
    delete sharesPartnerWise[partnerIp][msg];
    sharesFolderWise[fullFolderString].splice(
      sharesFolderWise[fullFolderString].indexOf(partnerIp),
      1
    );
    if (sharesFolderWise[fullFolderString].length === 0) {
      folderStructure[fullFolderString] = [];
      watcher.unwatch(fullFolderString);
    }
    console.log();
    console.log(sharesPartnerWise);
    console.log(sharesFolderWise);
    console.log(folderStructure);
    console.log();

    frontendSocket.emit('backend-remove-partner-folder', {
      selectedPartner: partnerIp,
      folderString: fullFolderString,
    });
  });

  /// ////////////////////////////////////////////////////////////////////////////////////////////////////

  // This section handles adding and removing partners

  // get partner list
  socket.on('frontend-get-partners', () => {
    console.log('frontend-get-partners', Object.keys(partners));
    socket.emit('backend-get-partners', Object.keys(partners));
  });

  // listen from frontend about a request to add a partner
  // and then send a partner request to the selected server
  socket.on('frontend-send-partner-request', async (msg) => {
    const receivedPartnerIp = msg.split(':')[0];
    if (partners[receivedPartnerIp] === undefined) {
      console.log('frontend-send-partner-request', msg);
      // connect to the requested server
      let pSocket = '';
      try {
        pSocket = ioc(`http://${msg}`, {
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

      potentialPartners[receivedPartnerIp] = pSocket;
      pSocket.emit('backend-send-partner-request');
    }
  });

  // in case the server receives a partner request the server
  // will do the same tasks as the requesting server did
  // but in addition it will send a confirm message
  socket.on('backend-send-partner-request', () => {
    if (partners[partnerIp] === undefined) {
      console.log(`backend-send-partner-request`, partnerIp);
      if (socket.handshake.address !== '::1') {
        // connect to the requested server
        let pSocket = '';
        try {
          pSocket = ioc(`http://${partnerIp}:9000`, {
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

        // send a confirm message so that the partner will add the server as a partner
        pSocket.emit('backend-confirm-partner-request');
        partners[partnerIp] = pSocket;
        frontendSocket.emit('backend-get-partners', Object.keys(partners));
      }
    }
  });

  // confirm the handshake
  socket.on('backend-confirm-partner-request', () => {
    partners[partnerIp] = potentialPartners[partnerIp];
    delete potentialPartners[partnerIp];
    frontendSocket.emit('backend-get-partners', Object.keys(partners));
    console.log('backend-confirm-partner-request', partnerIp);
  });

  // remove a specific partner
  socket.on('frontend-remove-partner', (arg) => {
    partners[arg.selectedPartner].emit();
    delete partners[arg.selectedPartner];
    frontendSocket.emit('backend-get-partners', Object.keys(partners));
    console.log('backend-confirm-partner-request', partnerIp);
  });
});

module.exports = { router, socketapi };
