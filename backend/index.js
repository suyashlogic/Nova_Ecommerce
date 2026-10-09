import app from './src/app.js';
import env from './src/config/env.js';

// In Express 5 the callback also receives startup errors
app.listen(env.port, (err) => {
  if (err) {
    console.error(
      err.code === 'EADDRINUSE'
        ? `Port ${env.port} is already in use. Stop the other server and try again.`
        : `Server failed to start: ${err.message}`
    );
    process.exit(1);
  }
  console.log(`NOVA API running on http://localhost:${env.port}`);
});
