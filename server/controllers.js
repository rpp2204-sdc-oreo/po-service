const { Product, Sku, Style, Feature, Photo } = require("../database/index.js");

exports.getProducts = (req, res) => {
  // TODO: Implement this route handler
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  const promise1 = Product.aggregate([
    { $sort: {id: 1} },
    { $skip: (page * 5) - 5 },
    { $limit: count }
  ])

  Promise.all([promise1]).then((values)=> {
    const result = [];

    for (var i = 0; i < values[0].length; i++) {
      const oldObj = values[0][i];
      let newObj = {};

      newObj["id"] = oldObj.id;
      newObj["name"] = oldObj.name;
      newObj["description"] = oldObj.description;
      newObj["category"] = oldObj.category;
      newObj["default_price"] = oldObj.default_price;

      result.push(newObj);
    }

    res.send(result);
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
    { $sort: { styleId: 1 }}
  ]).then((styles)=> {
    console.log('_________________________');
    console.log('STYLES: ', styles);
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
      modStyle["skus"] = [];
      modStyle["photos"] = [];

      result.results.push(modStyle);
    }
  }).then(()=>{

    for (var i = 0; i < styleIDs.length; i++) {
      const styleId = styleIDs[1];
      skuPromises.push(Sku.aggregate([{ $match: { styleId } }]));
      photoPromises.push(Photo.aggregate([{ $match: { styleId : String(styleIDs[i]) }}]));
    }

    console.log('PHOTO PROMISES: ', photoPromises);
    return Promise.all([Promise.all(skuPromises), Promise.all(photoPromises)]);
  }).then((results) => {
    console.log('_________________________')
    console.log('SKUS  : ', results[0]);
    console.log('PHOTOS: ', results[1])

    let styleSkus =

    res.send(result);
  })
};

exports.getFeatures = (req, res) => {
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

exports.getSkus = (req, res) => {
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

exports.getPhotos = (req, res) => {
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

