const http = require('http');
const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');

const oka = new Oka();

oka.use(serve(config.static));
oka.use(bodyParser());
oka.use((req, res) => {
  req
});

oka.listen(3000);
