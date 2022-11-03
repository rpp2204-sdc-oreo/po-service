const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/po_service');

//MONGO OBJECT AGGREGATION PIPELINE

const overviewSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
  features: [{
    feature: String,
    value: String,
  }],
  styles: [{
    original_price: Number,
    sale_price: Number,
    default: Boolean,
    photos: [String],
    skus: [{
      quantity: Number,
      size: String,
    }]
  }],
});

const productSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
});

const featureSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  product_id: Number,
  feature: String,
  value: String
});

const styleSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  product_id: Number,
  name: String,
  sale_price: Number,
  original_price: Number,
  default_style: Boolean
});

const skuSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  styleId: Number,
  size: String,
  quantity: String
});

const photoSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  styleId: Number,
  url: String,
  thumbnail_url: String
});

const Overview = new mongoose.model('overviews', overviewSchema);
const Product = new mongoose.model('products', productSchema);
const Feature = new mongoose.model('features', featureSchema);
const Style = new mongoose.model('styles', styleSchema);
const Sku = new mongoose.model('skus', skuSchema);
const Photo = new mongoose.model('photos', photoSchema);

module.exports.Overview = Overview;
module.exports.Product = Product;
module.exports.Style = Style;
module.exports.Feature = Feature;
module.exports.Sku = Sku;
module.exports.Photo = Photo;

