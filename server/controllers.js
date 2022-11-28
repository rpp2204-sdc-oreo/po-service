const { Overview, Product, Sku, Style, Feature, Photo } = require("../database/index.js");
const { Client } = require("../database/redis.js");

// ETL PURPOSES ONLY
exports.setProducts = async (req, res, next) => {

  for (i = 1; i <= 1000011; i++) {
    console.log('CURRENTLY WORKING ON PRODUCT NO.', i);
    const productPromise = await Product.aggregate([
      { $match: {id: i} },
      { $project: { _id: 0}},
    ]);

    const featurePromise = await Feature.aggregate([
      { $match: { product_id: i } },
      { $sort: {id: 1} },
      { $project: { _id: 0, id: 0, product_id: 0} },
    ]);

    const stylePromise = await Style.aggregate([
      { $match: { productId: i }},
      { $sort: {id: 1}},
      { $project: { _id: 0, productId: 0}},
    ]);

    await Promise.all([productPromise, featurePromise, stylePromise]).then(async (values) => {
      const product = values[0][0];
      const features = values[1];
      const styles = values[2];

      // Product in Progress
      var pip = {};

      // Product Info: name, slogan, description, category, default_price
      pip.id = product.id;
      pip.name = product.name;
      pip.slogan = product.slogan;
      pip.description = product.description;
      pip.category = product.category;
      pip.default_price = Number(product.default_price);
      pip.features = features;
      pip.styles = [];

      const styleStart = values[2][0] ? values[2][0].id : null;
      const styleEnd = styleStart + values[2].length
      if (styleStart){
        for (var i = 0; i < styles.length; i++) {
          // Style Info: original_price, sale_price, default_style
          var style = {};
          style['style_id'] = styles[i].id;
          style['name'] = styles[i].name;
          style['original_price'] = Number(styles[i].original_price);
          style['sale_price'] = Number(styles[i].sale_price);
          style['default?'] = Boolean(styles[i].default_style);
          style.photos = [];
          style.skus = {};

          const skuPromise = await Sku.aggregate([
            { $match: { styleId: styles[i].id } },
            { $sort: { id: 1 }},
            { $project : { _id : 0, styleId: 0 }},
          ]);

          const photoPromise = await Photo.aggregate([
            { $match: { styleId: styles[i].id } },
            { $sort: { id: 1 }},
            { $project : { _id : 0, styleId: 0, id: 0}}
          ]);

          await Promise.all([skuPromise, photoPromise]).then((values) => {
            // console.log('STYLE ID', i,'SKUS  : ', values[0]);
            const skus = values[0];
            const photos = values[1];

            skus.forEach((sku) => {
              style.skus[sku.id] = {
                size : sku.size,
                quantity: sku.quantity
              }
            });

            photos.forEach((photo) => {
              style.photos.push(photo)
            });
          })

          // add to styles.
          pip.styles.push(style);
        }
      }
      // console.log('PRODUCT IN PROGRESS: ', JSON.parse(JSON.stringify(pip, null, 3)));
      console.log("%o", pip);
      Overview.create({
        id: pip.id,
        name: pip.name,
        slogan: pip.slogan,
        description: pip.description,
        category: pip.category,
        default_price: pip.default_price || null,
        features: pip.features.length ? pip.features : [],
        styles: pip.styles.length ? pip.styles : [],
      });
    })
  }
  res.sendStatus(200);
}

// OLD INEFFICIENT GET PRODUCTS
// exports.getProducts = (req, res, next) => {
//   // Declare PAGE and COUNT from query params
//   const page = Number(req.query.page) || 1;
//   const count = Number(req.query.count) || 5;
//   const begID = (page * 5) - 5;
//   const endID = begID + count;

//   // Generate Aggregation.
//   const productPromise = Product.aggregate([
//     { $sort: {id: 1} },
//     { $skip: (page * 5) - 5 },
//     { $limit: count },
//     { $match:{ id: { $gte: begID, $lte: endID} } },
//     { $project: { _id : 0} }
//   ]);

//   // Run Aggregation.
//   Promise.all([productPromise]).then((values) => {
//     // Declare Result Array
//     const result = [];

//     // Loop through every product given from aggregation.
//     for (var i = 0; i < values[0].length; i++) {
//       // ... push every product into Result Array.
//       result.push(values[0][i]);
//     }

//     res.locals.result = result;

//     res.send(result);
//     next();
//   });
// };

// NEWER EFFICIENT GET PRODUCTS
exports.getProducts = (req, res, next) => {
  // Declare PAGE and COUNT from query params
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const begID = (page * 5) - 5;
  const endID = begID + count;

  // Generate Aggregation.
  Overview.aggregate([
    { $match:{ id: { $gte: begID, $lte: endID} } },
    { $project: { _id : 0, features: 0, styles: 0, __v: 0} }
  ]).then((values) => {
    res.locals.result = values;
    res.send(values);
    next();
  });
};

// OLD INEFFICIENT GET FEATURES
// exports.getFeatures = async (req, res, next) => {
//   // Declare PAGE and COUNT from query params.
//   const productID = Number(req.params.product_id);

//   const productPromise = await Product.aggregate([
//     { $match: { id : Number(productID)} },
//     { $project: { _id : 0} },
//   ]);

//   const featurePromise = await Feature.aggregate([
//     { $match: { product_id: Number(productID) }},
//     { $project: { _id: 0}},
//   ]);

//   // Run Aggregation.
//   Promise.all([productPromise, featurePromise]).then((values)=> {
//     const result = values;

//     res.locals.result = result;
//     res.send(result);
//     next();
//   });
// };

// NEWER EFFICIENT GET FEATURES
exports.getFeatures = async (req, res, next) => {
  // Declare PAGE and COUNT from query params.
  const productID = Number(req.params.product_id);

  Overview.aggregate([
    { $match:{ id: productID} },
    { $project: { _id : 0, styles: 0, __v: 0} }
  ]).then((values) => {
    res.locals.result = values;
    res.send(values);
    next();
  });
};

// OLD INEFFICIENT GET STYLES
// exports.getStyles = (req, res, next) => {
//   // TODO: Implement this route handler
//   const id = Number(req.params.product_id);
//   let styleIDs = [];
//   let skuPromises = [];
//   let photoPromises = [];
//   let result = {};
//   result.results = [];

//   Style.aggregate([
//     { $match: { productId: id}},
//     { $sort: { id : 1 }}
//   ]).then((styles)=> {
//     result.product_id = id;

//     for (var i = 0; i < styles.length; i++) {
//       const rawStyle = styles[i];
//       styleIDs.push(rawStyle.id);
//       let modStyle = {}

//       modStyle["style_id"] = rawStyle.id;
//       modStyle["name"] = rawStyle.name;
//       modStyle["original_price"] = rawStyle.original_price;
//       modStyle["sale_price"] = Number(rawStyle.sale_price) || 0;
//       modStyle["default?"] = Boolean(rawStyle.default_style);

//       result.results.push(modStyle);
//     }
//   }).then(()=>{

//     for (var i = 0; i < styleIDs.length; i++) {
//       const styleId = styleIDs[i];
//       skuPromises.push(Sku.aggregate([
//         { $match: { styleId } },
//         { $sort: { id: 1 }},
//         { $project : { _id : 0 , }},
//       ]));

//       photoPromises.push(Photo.aggregate([
//         { $match: { styleId } },
//         { $sort: { id: 1 }},
//         { $project : { _id : 0 }}
//       ]));
//     }

//     return Promise.all([Promise.all(skuPromises), Promise.all(photoPromises)]);
//   }).then((values) => {

//     values[0].map((value, i) => {
//       result.results[i].skus = value;
//     });

//     values[1].map((value, i) => {
//       result.results[i].photos = value;
//     });

//     res.locals.result = result;

//     res.send(result);
//     next();
//   })
// };

// NEWER EFFICIENT GET STYLES
exports.getStyles = (req, res, next) => {
  // TODO: Implement this route handler
  const productID = Number(req.params.product_id);

  Overview.aggregate([
    { $match:{ id: productID} },
    { $project: { _id : 0, __v: 0} }
  ]).then((values) => {
    const result = {
      product_id: values[0].id,
      results: values[0].styles
    }

    res.locals.result = result;
    res.send(result);

    next();
  });
};


exports.testFeatures = (req, res) => {
    // LOOK PERMANENTLY SORT DB
    const promise1 = Feature.find({}).sort({id: 1}).allowDiskUse(true);

    Promise.all([promise1]).then((values)=> {
      const result = [];

      for (var i = 0; i < 5; i++) {
        result.push(values[0][i]);
      }

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

    res.send(result);
  });
};

