console.log("starting")

const express = require('express');
const app = express();

app.listen(8000);
app.use(express.static(__dirname + '/public'));

