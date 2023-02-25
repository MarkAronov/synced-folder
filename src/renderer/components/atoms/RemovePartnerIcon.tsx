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
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useInfo } from '../../context/useInfo';

/**
 * The RemovePartnerIcon component
 * @return {JSX.Element} returns a RemovePartnerIcon component
 */
const RemovePartnerIcon = () => {
  // component settings and event data
  const info = useInfo();
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

  // handle the state of the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // handle the event where the input is valid and the user submitted it
  const handleRemove = () => {
    info.socket.emit('frontend-remove-partner', {
      selectedPartner,
    });
    const tempPTable = info.data.pTable.slice();
    const tempFTable = info.data.fTable.slice();
    for (let i = 0; i < tempFTable.length; i++) {
      if (tempFTable[i].partner === selectedPartner) {
        tempFTable.splice(i, 1);
      }
    }
    tempPTable.splice(tempPTable.indexOf(selectedPartner), 1);
    info?.setInfo({
      ...info.data,
      pTable: tempPTable,
      fTable: tempFTable,
    });
    setOpen(false);
    setSelectedPartner('');
  };

  return (
    <>
      <IconButton
        disabled={info.data?.pTable.length === 0}
        size="large"
        onClick={handleOpen}
      >
        <PersonRemoveIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select partner to remove</DialogTitle>
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
          <Button disabled={!disabledSend} onClick={handleRemove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RemovePartnerIcon;
