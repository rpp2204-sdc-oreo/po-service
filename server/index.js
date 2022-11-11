const axios = require('axios');
const express = require('express');
const db = require('../database/index.js');
const controllers = require('./controllers.js');
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
app.get('/products', controllers.getProducts);

// GET PRODUCT INFORMATION
app.get('/products/:product_id', controllers.getFeatures);

// GET PRODUCT STYLES
app.get('/products/:product_id/styles', controllers.getStyles);

// TEST ROUTES
app.get('/features', controllers.testFeatures);
app.get('/skus', controllers.testSkus);
app.get('/photos', controllers.testPhotos);

app.listen(port, function() {
  console.log(`listening on port ${port}`);
});

// MONGODUMP LOOK UP
// FS WRITE TURNING CSV INTO JSON (MONGODUMP MONGO IMPORT FILE STRUCTURE POSSIBLY BETTER THAN JSON).