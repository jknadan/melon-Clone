var schedule = require('node-cron');

setInterval(function () {
    console.log("실행");
},1000);

schedule.schedule('53 * * * *',function () {
    console.log("cron실행");
});