var express = require("express");
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors')
var app = express();
const cronJob = require('./cron.js');

const sale = require("./TineyDonkeyRoutes/sale")
const subscribe = require("./TineyDonkeyRoutes/newsletter")
const message = require("./TineyDonkeyRoutes/message")
const products = require("./TineyDonkeyRoutes/products");
const cashflow = require("./TineyDonkeyRoutes/cashflow");
const login = require("./TineyDonkeyRoutes/login");
const authentication = require("./TineyDonkeyRoutes/business");
const daysNgapi = require("./DaysNgapi/routes/user");

const url = process.env.URL
const testUrl = process.env.TEST_URL
const phone = process.env.PHONE
const daysNgapiDev = process.env.DAYS_NGAPI_DEV
const daysNgapiProd = process.env.DAYS_NGAPI_PROD

const normalize = (u) => u?.replace(/\/$/, '');
//Configure your allowed origins
const allowedOrigins = [
    url, daysNgapiProd, daysNgapiDev, testUrl, phone
].map(normalize);

console.log("Allowed origins:", allowedOrigins);
//Set up CORS middleware *before* any routes
app.use(cors({
    origin: (origin, cb) => {
      console.log("Request origin-->", origin);
      // allow non-browser requests
      if (!origin) return cb(null, true);
  
      if (allowedOrigins.includes(normalize(origin))) {
        return cb(null, true);
      }
  
      cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
//Explicitly handle OPTIONS preflight
app.options('*', cors());



const port = process.env.PORT || 3000
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

app.use(express.json());
app.use(express.static('Public', {
    maxAge: '1d'
}))
app.use(morgan('dev'));

app.use("/", sale);
app.use("/", subscribe);
app.use("/", message);
app.use("/", products);
app.use("/", cashflow);
app.use("/", login);
app.use("/", authentication);
app.use("/daysNgapi", daysNgapi);


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`listening on some port ${port}`)
    })
})
cronJob()