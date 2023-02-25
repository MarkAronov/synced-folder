import React, { useContext, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { DataContext } from './DataContext';

// backend connection, keep the connection always alive and event reconnect
const socket = io(':9000/', {
  reconnection: true,
  reconnectionDelay: 500,
  transports: ['websocket'],
  extraHeaders: {
    'frontend-header': 'frontend',
  },
});
socket.connect();

// this is basic react useContext language
const useProvideInfo = (): any => {
  // frontend data
  const [data, setData] = useState({
    fTable: [],
    pTable: [],
    error: { state: false, message: '' },
    ip: '',
  });

  const setInfo = (d: any) => {
    setData(d);
  };

  return { data, socket, setInfo };
};

export const ProvideData = ({ children }: any) => {
  const info: any = useProvideInfo();
  return <DataContext.Provider value={info}>{children}</DataContext.Provider>;
};

export const useInfo = () => useContext(DataContext);
