import express from 'express';
import config from './config/settings.js';
import auth from './service/auth.js';
import { barAlgorithm } from './service/barAlgorithm.js';
import { fooAlgorithm } from './service/fooAlgorithm.js';

const app = express();

function allow(_req, res) {
  res.json({ success: true });
}

app.use(auth);
app.get('/foo', fooAlgorithm, allow);
app.get('/bar', barAlgorithm, allow);

app.listen(config.port, () => {
  console.log(`Listening on ${config.port} using ${config.storage} storage`);
});

export default app;
