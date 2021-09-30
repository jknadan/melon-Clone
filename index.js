const express = require('./config/express');
const {logger} = require('./config/winston');
const scheduler = require('./config/scheduler');

const port = 3000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

// scheduler.js를 모듈로 exports했으니까 여기서 실행해줘야지
scheduler.schedule();
