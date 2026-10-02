import app from './src/app.js';
import env from './src/config/env.js';

app.listen(env.port, () => {
  console.log(`NOVA API running on http://localhost:${env.port}`);
});