import React, { useEffect, useState, memo } from 'react';

import {
  useMediaQuery,
  Toolbar,
  AppBar,
  Box,
  Typography,
} from '@mui/material/';
import { useTheme } from '@mui/material/styles';
import AddFolderIcon from '../atoms/AddFolderIcon';
import RemoveFolderIcon from '../atoms/RemoveFolderIcon';
import HeaderPartnersIcon from '../atoms/HeaderPartnersIcons';
/**
 * The Header component
 * @param {object} props object file that contains all the needed props to
 *                       control the Header
 * @return {JSX.Element} returns a Header component
 */
const Header = (): JSX.Element => {
  const theme = useTheme();
  const widthChange = useMediaQuery(theme.breakpoints.down('sm'));
  const [ip, setIp] = useState('');

  window.electron.ipcRenderer.sendMessage('get-ip', []);

  useEffect(() => {
    window.electron.ipcRenderer.once('get-ip', (arg) => {
      setIp(arg);
    });
  }, [ip]);

  const LeftSection = () => (
    <>
      <Typography variant="body1">{`Synced Folder - ${ip}:9000`}</Typography>
      <Box
        sx={{
          flexGrow: 1,
        }}
      />
    </>
  );

  const RightSection = memo(() => (
    <>
      <Box
        sx={{
          display: widthChange ? 'none' : 'flex',
          flexGrow: 1,
          [theme.breakpoints.down('sm')]: {
            flexGrow: 0,
          },
        }}
      />
      <Box sx={{ display: widthChange ? 'none' : 'flex' }}>
        <AddFolderIcon />
        <RemoveFolderIcon />
        <HeaderPartnersIcon />
      </Box>
    </>
  ));
  RightSection.displayName = 'RightSection';

  return (
    <AppBar
      sx={{
        height: '48px',
        justifyContent: 'space-between',
        overflowX: 'auto',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ backgroundColor: 'inherit' }} variant="dense">
        <LeftSection />
        <RightSection />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
