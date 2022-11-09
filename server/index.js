const axios = require('axios');
const express = require('express');
const db = require('../database/index.js');
const controllers = require('./controllers.js');
let app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let port = 4000;

// ACTUAL ROUTES
app.get('/products', controllers.getProducts);
app.get('/products/:product_id', controllers.getFeatures);
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