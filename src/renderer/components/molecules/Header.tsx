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
import RemovePartnerIcon from '../atoms/RemovePartnerIcon';
import HeaderPartnersIcon from '../atoms/HeaderPartnersIcons';
/**
 * The Header component
 * This component holds the user's local ip the port, in addition the header
 * holds 4 icons responsible for different tasks
 * @return {JSX.Element} returns a Header component
 */
const Header = (): JSX.Element => {
  const theme = useTheme();
  const widthChange = useMediaQuery(theme.breakpoints.down('sm'));
  const [ip, setIp] = useState('');

  // request local ip of user's pc
  window.electron.ipcRenderer.sendMessage('get-ip', []);

  // listen back for a replay and then add the local ip to the header banner
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
        <RemoveFolderIcon />
        <AddFolderIcon />
        <RemovePartnerIcon />
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
