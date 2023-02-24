import React, { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Badge,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { useInfo } from '../../context/useInfo';

/**
 * The HeaderPartnersIcon component
 * @return {JSX.Element} returns a HeaderPartnersIcon component
 */
const HeaderPartnersIcon = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [disabledSend, setDisabledSend] = useState(false);
  const [ipString, setIpString] = useState('');
  const [portString, setPortString] = useState('');
  const [fullString, setFullString] = useState('');
  const info = useInfo();

  const handleOpen = () => {
    setOpen(true);
  };
  useEffect(() => {
    const ipAddressRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const port = Number(portString);
    setDisabledSend(
      ipAddressRegex.test(ipString) &&
        !Number.isNaN(port) &&
        port >= 1 &&
        port <= 65535
    );
  }, [ipString, portString]);

  const handleClose = () => {
    setOpen(false);
    setIpString('');
    setPortString('');
    setFullString('');
  };

  const handleSubmit = async () => {
    setOpen(false);
    await info.socket.emit(
      'frontend-send-partner-request',
      `${ipString}:${portString}`
    );
    setIpString('');
    setPortString('');
    setFullString('');
  };

  const handleChange = (event) => {
    setIpString(event.target.value.split(':')[0]);
    setPortString(event.target.value.split(':')[1]);
    setFullString(event.target.value);
  };
  return (
    <>
      <IconButton size="large" onClick={handleOpen}>
        <Badge badgeContent={0} color="error">
          <GroupsIcon />
        </Badge>
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Input partners ip address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="ipString"
            label="Partner IP"
            type="text"
            fullWidth
            variant="standard"
            value={fullString}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={!disabledSend} onClick={handleSubmit}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HeaderPartnersIcon;
