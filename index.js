var express = require("express");
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');

const sale = require("./TineyDonkeyRoutes/sale")
const subscribe = require("./TineyDonkeyRoutes/newsletter")
const message = require("./TineyDonkeyRoutes/message")
const products = require("./TineyDonkeyRoutes/products");
const cashflow = require("./TineyDonkeyRoutes/cashflow");
const login = require("./TineyDonkeyRoutes/login");
const authentication = require("./TineyDonkeyRoutes/business");
const daysNgapi = require("./DaysNgapi/routes/user");

const blockUrlMiddleware = require('./blockUrlMiddleware');
const cronJob = require('./cron.js');
const cors = require('cors')
var app = express();

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
app.use(blockUrlMiddleware);
app.use(express.json());
app.use(express.static('Public', {
    maxAge: '1d'
}))

app.use(cors({
  origin: ['https://days-ngapi.vercel.app', 'https://tineydonkey.shop'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     next();
// });
// app.use(cors())
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