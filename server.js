import './config/config.js'; 
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/connectdb.js';
import router from './routes/auth/authRoutes.js';

const app = express();
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.use(cors());
connectDb(DB_URL);
app.use(express.json());
app.use('/api/auth', router);

app.listen(port, () => {
    console.log('Server running on port ' + port);
});
