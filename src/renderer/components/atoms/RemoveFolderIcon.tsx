import React, { useState, useEffect } from 'react';
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
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import { useInfo } from '../../context/useInfo';

/**
 * The RemoveFolderIcon component
 * @return {JSX.Element} returns a RemoveFolderIcon component
 */
const RemoveFolderIcon = () => {
  // component settings and event data
  const info = useInfo();
  const [selectedShare, setSelectedShare] = useState({});
  const [open, setOpen] = useState(false);
  const [disabledSend, setDisabledSend] = useState(false);

  // reset event data on close
  const handleClose = () => {
    setOpen(false);
    setSelectedShare('');
  };
  // check constantly for changes in the input and decide whether the input is a valid target
  useEffect(() => {
    setDisabledSend(
      selectedShare &&
        Object.keys(selectedShare).length === 0 &&
        Object.getPrototypeOf(selectedShare) === Object.prototype
    );
  }, [selectedShare]);

  // add the dialog content into the event data variables
  const handleChange = (event) => {
    setSelectedShare(event.target.value as string);
  };

  // handle the state of the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // handle the event where the input is valid and the user submitted it
  const handleRemove = () => {
    info.socket.emit('frontend-remove-partner-folder-share', {
      selectedPartner: selectedShare.partner,
      folderString: selectedShare.folder,
    });
    const tempFTable = info.data.fTable.slice();
    for (let i = 0; i < tempFTable.length; i++) {
      if (
        tempFTable[i].folder === selectedShare.folder &&
        tempFTable[i].partner === selectedShare.partner
      ) {
        tempFTable.splice(i, 1);
      }
    }
    info?.setInfo({
      ...info.data,
      fTable: tempFTable,
    });
    setOpen(false);
    setSelectedShare('');
  };

  return (
    <>
      <IconButton
        disabled={info.data?.fTable.length === 0}
        size="large"
        onClick={handleOpen}
      >
        <FolderDeleteIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select shared folder to remove</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 3 }}>
            <InputLabel id="simple-select-label">Shared folders</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={selectedShare}
              label="Shared folders"
              onChange={handleChange}
            >
              {info.data.fTable.map((item) => (
                <MenuItem key={1 + Math.random()} value={item}>
                  {`${item.folder} - ${item.partner}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={!disabledSend} onClick={handleRemove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RemoveFolderIcon;
