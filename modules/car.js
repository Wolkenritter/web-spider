const https = require('https')
const cherrio = require('cheerio')
const fs = require('fs')
const mysql = require('mysql')
const iconv = require('iconv-lite'); // 网页编码转换插件

const mysqlConfig = require('../config/mysql')
const connection = mysql.createConnection(mysqlConfig)
connection.connect()

const currentFileName = __filename.replace(__dirname, "").substr(1).replace('.js', '.json')
const { writeFileData, deleteFiles, downloadImg } = require('../utils/utils')

const host = "https://www.autohome.com.cn/grade/carhtml"
let charCodeArr = []
for (let i = 0; i < 26; i++) {
    charCodeArr.push(String.fromCharCode(65 + i))
}


const getData = async () => { 
    let allData = []
    charCodeArr.forEach(async item => {
        let html = [];
        await https.get(`${host}/${item}.html`, async res => {
            res.on("data", async chunk => {
                html.push(chunk);
            })
            res.on("end", async () => {
                var resultBuffer = iconv.decode(Buffer.concat(html), 'gb2312');
                const $ = await cherrio.load(resultBuffer, { decodeEntities: false });

                $('dl dt').each(function () {
                    const imgUrl = $('img', this).attr('src')
                    const name = $(this).find('div a').text()

                    const data = {
                        imgUrl,
                        name,
                        initial: item
                    }
                    allData.push(data) 
                    
                    allData.sort((a, b) => {
                        return a.initial - b.initial
                    })
                    console.log(allData)
                    writeFileData(currentFileName, allData)
                    insertToMysql(data)
                })
            })
        })
        
    })
    
    console.log('文件存储成功')
    // connection.end()
}
getData()

const insertToMysql = (data) => {
    connection.query('INSERT INTO car SET ?', data, function (error, results, fields) {
        if (error) throw error
    })
}

module.exports = getData