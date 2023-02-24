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
 * @return {JSX.Element} returns a AddFolderIcon component
 */
const AddFolderIcon = () => {
  const info = useInfo();
  const [folderString, setFolderString] = useState('');
  const [selectedParter, setSelectedParter] = useState('');
  const [open, setOpen] = useState(false);
  const [disabledSend, setDisabledSend] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setSelectedParter('');
  };

  useEffect(() => {
    setDisabledSend(selectedParter !== '');
  }, [selectedParter]);

  const handleChange = (event) => {
    setSelectedParter(event.target.value as string);
  };

  const handleFolder = async () => {
    window.electron.ipcRenderer.sendMessage('open-dir', []);
    window.electron.ipcRenderer.once('open-dir', (arg) => {
      console.log(`Picked: ${arg}`);
      setFolderString(arg);
      setOpen(true);
    });
  };

  const handleSubmit = () => {
    info.socket.emit('frontend-send-partner-folder-share', {
      selectedParter,
      folderString,
    });
    info?.setInfo({
      ...info.data,
      ftable: info?.data.ftable.concat({
        folder: folderString,
        partner: selectedParter,
      }),
    });
    setOpen(false);
    setSelectedParter('');
  };

  return (
    <>
      <IconButton component="span" size="large" onClick={handleFolder}>
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
              value={selectedParter}
              label="Partner"
              onChange={handleChange}
            >
              {info.data.ptable.map((item) => (
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
