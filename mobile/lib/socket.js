import { io } from 'socket.io-client';

const socket = io('http://192.168.1.150:5002', {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
