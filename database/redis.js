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
  const key = JSON.stringify(req.url);

  try {
    const data = await client.get(key);
    if (data) {
      res.status(200).send(JSON.parse(data));
    } else {
      next();
    };
  } catch ( err ){
    res.status(500).send({ error: err.message });
  }
};

client.redisInsert = async (req, res, next) => {
  const key = JSON.stringify(req.url);
  const val = JSON.stringify(res.locals.result);

  const data = await client.set(key, val);
};

module.exports.Insert = client.redisInsert;
module.exports.Find = client.redisFind;
module.exports.Client = client;