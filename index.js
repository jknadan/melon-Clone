const express = require('./config/express');
const {logger} = require('./config/winston');
const scheduler = require('./config/scheduler');
//
// const schedule = require("../api-server-node/node_modules/node-schedule");
//
// var job = schedule.scheduleJob('30 * * * *',function () {
//
//     console.log("타이머 실행 여부");
// });
const port = 3000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

scheduler.schedule();

// setInterval(function () {
//     let mNow = new Date();
//     console.log(mNow);
// },1000);
//
