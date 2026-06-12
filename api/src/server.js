import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/index.js';
import { env } from './config/env.js';
import { startCronJobs } from './jobs/cron.js';

const PORT = env.PORT || 4000;

const server = http.createServer(app);

initSocket(server);

async function start() {
  // connectDB handles retries internally and logs errors — does not throw
  await connectDB();

  server.listen(PORT, () => {
    console.log(`FreelanceOS API running on port ${PORT}`);
  });

  startCronJobs();
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
