import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoose from 'mongoose';

// import router
import router from './router';

const app = express();

app.use(cors({
    credentials: true,
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Creating server
const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Server started on port 3000');
});

// Connecting to MongoDB
const MONGO_URI = 'mongodb://localhost:27017/ts-node';

// mongoose.Promise = Promise;
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error: Error) => {
    console.log('Error connecting to MongoDB', error);
});
// mongoose.connection.on('error', (error: Error) => {
//     console.log('Error connecting to MongoDB', error);
// });

// All Routers 
app.use('/api', router());