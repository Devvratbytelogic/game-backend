import './config/config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { connectDb } from './config/connectdb.js';
import router from './routes/routes.js';
// import { housekeepingCronJobs, startCronJobs } from './utils/cronJobs.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.use(cors());
connectDb(DB_URL);
app.use(express.json())
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, }))
app.use(express.static("public"))
app.use('/api', router);
// startCronJobs();
// housekeepingCronJobs();
app.listen(port, () => {
    console.log('Server running on port ' + port);
});
