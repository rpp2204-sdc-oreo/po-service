const axios = require('axios');
const express = require('express');
const db = require('../database/index.js');
const controllers = require('./controllers.js');
const cache = require('../database/redis.js');
let app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req,res, next) => {
  console.log('REQ   :', req.method);
  console.log('BODY  :', req.originalUrl);
  console.log('PARAMS:', req.params);
  next();
});
let port = 4000;

// ACTUAL ROUTES

// GET PRODUCTS
app.get('/products', cache.Find, controllers.getProducts, cache.Insert);

// GET PRODUCT INFORMATION
app.get('/products/:product_id', cache.Find, controllers.getFeatures, cache.Insert);

// GET PRODUCT STYLES
app.get('/products/:product_id/styles', controllers.getStyles);

// LOADER IO
app.get('/loaderio-a69fa3aea08d61b85781f6f5454112b1', (req, res) => {
  res.send('loaderio-a69fa3aea08d61b85781f6f5454112b1');
});

// TEST ROUTES
app.get('/features', controllers.testFeatures);
app.get('/skus', controllers.testSkus);
app.get('/photos', controllers.testPhotos);


app.listen(port, function() {
  console.log(`listening on port ${port}`);
});

// MONGODUMP LOOK UP
// FS WRITE TURNING CSV INTO JSON (MONGODUMP MONGO IMPORT FILE STRUCTURE POSSIBLY BETTER THAN JSON).
