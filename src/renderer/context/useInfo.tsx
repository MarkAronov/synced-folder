import React, { useContext, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { DataContext } from './DataContext';

const socket = io(':9000/', {
  reconnection: true,
  reconnectionDelay: 500,
  transports: ['websocket'],
  extraHeaders: {
    'frontend-header': 'frontend',
  },
});

socket.connect();

const useProvideInfo = (): any => {
  const [data, setData] = useState({
    ftable: [],
    ptable: [],
    error: { state: false, message: '' },
  });

  const setInfo = (d: any) => {
    setData(d!);
  };

  return { data, socket, setInfo };
};

export const ProvideData = ({ children }: any) => {
  const info: any = useProvideInfo();
  return <DataContext.Provider value={info}>{children}</DataContext.Provider>;
};

export const useInfo = () => useContext(DataContext);
