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
  Snackbar,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useInfo } from '../../context/useInfo';
import Header from '../molecules/Header';

/**
 * Warpping function that adds a header and a drawer to the page
 * @param {any} props contians the page
 * @return {JSX.Element} the specific page
 */
const FrontPage = () => {
  const info = useInfo();
  const theme = useTheme();
  const [openPicker, setOpenPicker] = useState(false);
  const [backendData, setBackendData] = useState({});

  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    info.data.error = { state: false, message: '' };
    info.setInfo(info.data);
  };

  info.socket.on('backend-get-partners', (msg) => {
    console.log(msg);
    if (
      !(info?.data.ptable.length === msg.length) &&
      info?.data.ptable.every((element, index) => {
        return element === msg[index];
      })
    ) {
      info?.setInfo({
        ...info.data,
        ptable: info?.data.ptable.concat(msg),
      });
    }
  });

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
        ftable: info?.data.ftable.concat({
          folder: arg,
          partner: dataToSend.selectedParter,
        }),
      });
    });
    setBackendData({});
  }

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
                {info?.data.ptable?.map((row) => (
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
                {info?.data.ftable.map((row) => (
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
      <Snackbar
        open={info.data.error.state}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Note archived"
        action={
          <>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </Box>
  );
};

export default FrontPage;
