const schedule = require('node-schedule')

const rule = "30 * * * * *"
schedule.scheduleJob(rule, () => {
    console.log(new Date())
})