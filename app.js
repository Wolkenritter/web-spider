const fs = require('fs')
const http = require('http')

// fs.readdir('./modules', function (err, files) {
//     files.forEach(item => {
//         const getData = require('./modules/' + item)
//         getData()
//     })
// })

http.createServer((req, res) => {
    console.log(req)
    console.log(res)
}).listen(3066)