import 'dotenv/config';
import express from 'express';
import fooRouter from './routes/foo.js';
import barRouter from './routes/bar.js';
import auth from './service/auth.js';

const app = express();
app.use(express.json());
app.use(auth);
app.use('/foo', fooRouter);
app.use('/bar', barRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

export default app;
