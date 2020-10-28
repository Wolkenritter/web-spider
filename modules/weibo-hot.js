const cheerio = require('cheerio')
const https = require('https')
const mysql = require('mysql')

const mysqlConfig = require('../config/mysql')
const connection = mysql.createConnection(mysqlConfig)
connection.connect()

const host = "https://s.weibo.com"
const searchUrl = "/top/summary?cate=realtimehot"

let html = ''
const currentFileName = __filename.replace(__dirname, "").substr(1).replace('.js', '.json')
const { writeFileData } = require('../utils/utils')

const getData = () => {
    console.log('weibo')

    https.get(host + searchUrl, res => {
        res.on('data', chunk => {
            html += chunk
        })
        res.on('end', () => {
            const $ = cheerio.load(html)
            let dataArray = []
            $("#pl_top_realtimehot tbody tr").each(function (index, ele) {
                let obj
                if (index == 0) {
                    const $td2 = $(this).find('.td-02')
                    const a = $td2.find('a')
                    const span = $td2.find('span')
                    const $td3 = $td2.next()
                    obj = {
                        ranktop: 0,
                        title: a.text(),
                        link: host + a.attr("href"),
                        hotValue: span.text(),
                        label: $td3.find('i').text()
                    }
                    if ($td2.find('img') && $td2.find('img').attr('src')) {
                        obj.img = $td2.find('img').attr('src')
                    }
                } else {
                    const $td1 = $(this).find('.td-01')
                    const $td2 = $td1.next()
                    const a = $td2.find('a')
                    const span = $td2.find('span')
                    const $td3 = $td2.next()
                    obj = {
                        ranktop: $td1.text(),
                        title: a.text(),
                        link: host + a.attr('href'),
                        hotValue: span.text(),
                        label: $td3.find('i').text()
                    }
                    if ($td2.find('img') && $td2.find('img').attr('src')) {
                        obj.img = $td2.find('img').attr('src')
                    }
                }
                insertToMysql(obj)
                dataArray.push(obj)
            })

            writeFileData(currentFileName, dataArray)
            connection.end()
        })
    })
}

const insertToMysql = (data) => {
    connection.query('INSERT INTO weibo_hot SET ?', data, function (error, results, fields) {
        if (error) throw error
    })
}

module.exports = getData