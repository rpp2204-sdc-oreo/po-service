const redis = require('redis');

const client = redis.createClient({url: 'redis://default@127.0.0.1'});

client.connect();

client.on('connect', ()=>{{
  console.log('Redis connected');
}});

client.on('error', ()=>{{
  console.log('connection error');
}});

client.redisFind = async (req, res, next) => {
  const key = req.url;

  try {
    const data = await client.get(key);
    if (data) {
      console.log('DATA RETRIEVED FROM REDIS:', JSON.parse(data));
      res.status(200).send(JSON.parse(data));
    } else {
      console.log('Cache failed');
      next();
    };
  } catch ( err ){
    res.status(500).send({ error: err.message });
  }
}

client.redisInsert = async (req, res, next) => {
  const key = req.url;
  const value = JSON.stringify(res.locals.result);

  const data = await client.set(key, value);
  if (data) {
    console.log('REDIS SUCCESFULLY WROTE', data);
  }
}

module.exports.Insert = client.redisInsert;
module.exports.Find = client.redisFind;
module.exports.Features = client.redisFeatures;
module.exports.Client = client;