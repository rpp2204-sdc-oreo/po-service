const { Product, Sku, Style, Feature, Photo } = require("../database/index.js");
const { Client } = require("../database/redis.js");

exports.getProducts = (req, res, next) => {
  // Declare PAGE and COUNT from query params
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  // Generate Aggregation.
  const productPromise = Product.aggregate([
    { $sort: {id: 1} },
    { $skip: (page * 5) - 5 },
    { $limit: count },
    { $project: { _id : 0} }
  ]);

  // Run Aggregation.
  Promise.all([productPromise]).then((values) => {
    // Declare Result Array
    const result = [];

    // Loop through every product given from aggregation.
    for (var i = 0; i < values[0].length; i++) {
      // ... push every product into Result Array.
      result.push(values[0][i]);
    }

    res.locals.result = result;
    console.log('RESULT WRITTEN: ', res.locals.result);
    res.send(result);
    next();
  });
};

exports.getFeatures = (req, res, next) => {
  // Declare PAGE and COUNT from query params.
  const {productID, key} = req.params.product_id

  const productPromise = Product.aggregate([
    { $match: { id : Number(productID)} },
    { $project: { _id : 0} },
  ]);

  const featurePromise = Feature.aggregate([
    { $match: { product_id: Number(productID) }},
    { $sort: { id: 1 }},
    { $project: { _id: 0}}
  ]);

  // Run Aggregation.
  Promise.all([productPromise, featurePromise]).then((values)=> {
    console.log('MONGO GOT: ', values);
    res.send(values);
    next();
  });
};

exports.getStyles = (req, res) => {
  // TODO: Implement this route handler
  const id = Number(req.params.product_id);
  let styleIDs = [];
  let skuPromises = [];
  let photoPromises = [];
  let result = {};
  result.results = [];

  Style.aggregate([
    { $match: { productId: id}},
    { $sort: { id : 1 }}
  ]).then((styles)=> {
    result.product_id = id;

    for (var i = 0; i < styles.length; i++) {
      const rawStyle = styles[i];
      styleIDs.push(rawStyle.id);
      let modStyle = {}

      modStyle["style_id"] = rawStyle.id;
      modStyle["name"] = rawStyle.name;
      modStyle["original_price"] = rawStyle.original_price;
      modStyle["sale_price"] = Number(rawStyle.sale_price) || 0;
      modStyle["default?"] = Boolean(rawStyle.default_style);

      result.results.push(modStyle);
    }
  }).then(()=>{

    for (var i = 0; i < styleIDs.length; i++) {
      const styleId = styleIDs[i];
      skuPromises.push(Sku.aggregate([
        { $project : { _id : 0 , }},
        { $match: { styleId } },
        { $sort: { id: 1 }}
      ]));

      photoPromises.push(Photo.aggregate([
        { $project : { _id : 0 }},
        { $match: { styleId } },
        { $sort: { id: 1 }}
      ]));
    }

    return Promise.all([Promise.all(skuPromises), Promise.all(photoPromises)]);
  }).then((values) => {

    values[0].map((value, i) => {
      result.results[i].skus = value;
    });

    values[1].map((value, i) => {
      result.results[i].photos = value;
    });

    console.log('RESULT: ', result);
    res.send(result);
  })
};

exports.testFeatures = (req, res) => {
    // LOOK PERMANENTLY SORT DB
    const promise1 = Feature.find({}).sort({id: 1}).allowDiskUse(true);

    Promise.all([promise1]).then((values)=> {
      const result = [];

      for (var i = 0; i < 5; i++) {
        result.push(values[0][i]);
      }

      console.log(result);
      res.send(result);
    });
};

exports.testSkus = (req, res) => {
  // LOOK PERMANENTLY SORT DB
  const promise1 = Sku.find({}).sort({id: 1}).allowDiskUse(true);

  Promise.all([promise1]).then((values)=> {
    const result = [];

    for (var i = 0; i < 5; i++) {
      result.push(values[0][i]);
    }

    console.log(result);
    res.send(result);
  });
};

exports.testPhotos = (req, res) => {
  // LOOK PERMANENTLY SORT DB
  const promise1 = Photo.find({}).sort({id: 1}).allowDiskUse(true);
  const test = Photo.aggregate([
    { $match: { styleId : "1" } }
  ]);

  Promise.all([test]).then((values)=> {
    const result = [];

    for (var i = 0; i < 5; i++) {
      result.push(values[0][i]);
    }

    console.log(result);
    res.send(result);
  });
};

