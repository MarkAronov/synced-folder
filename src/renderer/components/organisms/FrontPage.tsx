import React, { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useInfo } from '../../context/useInfo';
import Header from '../molecules/Header';

/**
 * FrontPage holds all of the frontend's components together, this includes:
 * The header
 * The partners table
 * The shared folders table
 * @return {JSX.Element} the specific page
 */
const FrontPage = () => {
  const info = useInfo();
  const theme = useTheme();
  const [openPicker, setOpenPicker] = useState(false);
  const [backendData, setBackendData] = useState({});

  // listen for backend on getting a list of active partners and then save it
  info.socket.on('backend-get-partners', (msg) => {
    if (
      !(info?.data.pTable.length === msg.length) &&
      info?.data.pTable.every((element, index) => {
        return element === msg[index];
      })
    ) {
      info?.setInfo({
        ...info.data,
        pTable: msg,
      });
    }
  });

  // open up a dialog in order to pick a location for the shared folder
  info.socket.on('backend-pick-shared-folder-location', (msg) => {
    setBackendData(msg);
    setOpenPicker(true);
  });
  if (openPicker) {
    setOpenPicker(false);
    window.electron.ipcRenderer.sendMessage('open-dir', []);
    window.electron.ipcRenderer.once('open-dir', (arg) => {
      const dataToSend = { ...backendData };
      dataToSend.folderPathString = arg;
      info.socket.emit('frontend-picked-shared-folder-location', dataToSend);
      info?.setInfo({
        ...info.data,
        fTable: info?.data.fTable.concat({
          folder: `${arg}\\${dataToSend.folder}`,
          partner: dataToSend.partner,
        }),
      });
    });
    setBackendData({});
  }

  info.socket.on('backend-remove-partner-folder', (msg) => {
    const tempFTable = info.data.fTable.split();
    for (let i = 0; i < tempFTable.length; i++) {
      if (
        tempFTable[i].folder === msg.folderString &&
        tempFTable[i].partner === msg.selectedPartner
      ) {
        tempFTable.splice(i, 1);
      }
    }
    info?.setInfo({
      ...info.data,
      fTable: tempFTable,
    });
  });

  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'auto',
        height: 'auto',
        minHeight: '100vh',
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          backgroundColor: (themes) =>
            themes.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100],
          flexGrow: 1,
          mt: '48px',
          py: 3,
        }}
      >
        <Container maxWidth="lg" sx={{ px: 0, py: 0 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Partners</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {info?.data.pTable?.map((row) => (
                  <TableRow
                    key={1 + Math.random()}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer component={Paper} sx={{ px: 0, my: 5 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Folder</TableCell>
                  <TableCell align="center">Partner</TableCell>
                  {/* <TableCell align="right">Options</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {info?.data.fTable.map((row) => (
                  <TableRow
                    key={1 + Math.random()}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.folder}
                    </TableCell>
                    <TableCell align="center">{row.partner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Box>
  );
};

export default FrontPage;
