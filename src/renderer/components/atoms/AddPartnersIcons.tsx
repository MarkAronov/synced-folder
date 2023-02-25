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
 * The AddPartnersIcons component
 * This component gives the user the ability to add a new partner
 * @return {JSX.Element} returns a AddPartnersIcons component
 */
const AddPartnersIcons = () => {
  // component settings and event data
  const [open, setOpen] = useState(false);
  const [disabledSend, setDisabledSend] = useState(false);
  const [ipString, setIpString] = useState('');
  const [portString, setPortString] = useState('');
  const [fullString, setFullString] = useState('');
  const info = useInfo();

  // handle the state of the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // check constantly for changes in the input and decide whether the input is a valid target
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

  // reset event data on close
  const handleClose = () => {
    setOpen(false);
    setIpString('');
    setPortString('');
    setFullString('');
  };

  // handle the event where the input is valid and the user submitted it
  const handleSubmit = async () => {
    if (info.data.ip !== ipString) {
      await info.socket.emit(
        'frontend-send-partner-request',
        `${ipString}:${portString}`
      );
    }
    setIpString('');
    setPortString('');
    setFullString('');
    setOpen(false);
  };

  // add the dialog content into the event data variables
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

export default AddPartnersIcons;
