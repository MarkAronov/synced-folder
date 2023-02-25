import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useInfo } from '../../context/useInfo';

/**
 * The AddFolderIcon component
 * This component gives the user the ability to add a folder to share
 * @return {JSX.Element} returns a AddFolderIcon component
 */
const AddFolderIcon = () => {
  // component settings and event data
  const info = useInfo();
  const [folderString, setFolderString] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [open, setOpen] = useState(false);
  const [disabledSend, setDisabledSend] = useState(false);

  // reset event data on close
  const handleClose = () => {
    setOpen(false);
    setSelectedPartner('');
  };

  // check constantly for changes in the input and decide whether the input is a valid target
  useEffect(() => {
    setDisabledSend(selectedPartner !== '');
  }, [selectedPartner]);

  // add the dialog content into the event data variables
  const handleChange = (event) => {
    setSelectedPartner(event.target.value as string);
  };

  // send a request to electron to open a directory dialog and then get the selected location
  const handleFolder = async () => {
    window.electron.ipcRenderer.sendMessage('open-dir', []);
    window.electron.ipcRenderer.once('open-dir', (arg) => {
      setFolderString(arg);
      setOpen(true);
    });
  };

  // handle the event where the input is valid and the user submitted it
  const handleSubmit = () => {
    if (
      !info.data.fTable.find(
        (item) =>
          item.folder === folderString && item.partner === selectedPartner
      )
    ) {
      info.socket.emit('frontend-send-partner-folder-share', {
        selectedPartner,
        folderString,
      });
      info?.setInfo({
        ...info.data,
        fTable: info?.data.fTable.concat({
          folder: folderString,
          partner: selectedPartner,
        }),
      });
    }
    setOpen(false);
    setSelectedPartner('');
  };

  return (
    <>
      <IconButton
        component="span"
        size="large"
        onClick={handleFolder}
        disabled={info.data?.pTable.length === 0}
      >
        <CreateNewFolderIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select partner to share with</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 3 }}>
            <InputLabel id="simple-select-label">Partner</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={selectedPartner}
              label="Partner"
              onChange={handleChange}
            >
              {info.data.pTable.map((item) => (
                <MenuItem key={1 + Math.random()} value={item}>
                  {`${item}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

export default AddFolderIcon;
