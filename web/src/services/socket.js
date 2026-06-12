import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const useDummy = import.meta.env.VITE_USE_DUMMY_DATA !== 'false';

let socket = null;

// Dummy-mode scripted event emitter
function createDummySocket() {
  const handlers = {};
  return {
    on(event, cb) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(cb);
    },
    off(event, cb) {
      if (handlers[event]) {
        handlers[event] = handlers[event].filter(h => h !== cb);
      }
    },
    emit(event, data) {
      // no-op for dummy client
    },
    _trigger(event, data) {
      (handlers[event] || []).forEach(cb => cb(data));
    },
    disconnect() {},
    connected: true,
  };
}

export function initSocket() {
  if (useDummy) {
    socket = createDummySocket();
    // Simulate a tax:updated event 3s after init
    setTimeout(() => {
      socket._trigger('tax:updated', {});
      useUIStore.getState().markTaxUpdated();
    }, 3000);
    return socket;
  }

  const { accessToken } = useAuthStore.getState();
  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[socket] connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
  });

  socket.on('payment:created', () => {
    useUIStore.getState().markPaymentCreated();
  });

  socket.on('tax:updated', () => {
    useUIStore.getState().markTaxUpdated();
  });

  socket.on('cashflow:danger', (data) => {
    useUIStore.getState().setDangerWindows([data.data]);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
