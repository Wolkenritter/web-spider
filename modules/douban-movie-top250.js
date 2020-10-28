const https = require('https')
const cherrio = require('cheerio')
const fs = require('fs')
const mysql = require('mysql')

const mysqlConfig = require('../config/mysql')
const connection = mysql.createConnection(mysqlConfig)
connection.connect()

const currentFileName = __filename.replace(__dirname, "").substr(1).replace('.js', '.json')
const { writeFileData, deleteFiles, downloadImg } = require('../utils/utils')

const host = "https://movie.douban.com"
const searchUrl = "/top250"
let html = "";
let allFilms = [];
const getData = async () => {
    https.get(`${host}${searchUrl}`, async res => {
        res.on("data", async chunk => {
            html += chunk;
        })

        res.on("end", async () => {
            const $ = await cherrio.load(html);
            // 这里不要使用箭头函数
            $("li .item").each(function () {
                const title = $('.title', this).text()
                const average = $('.rating_num', this).text()
                const imgUrl = $('.pic img', this).attr('src');
                const data = {
                    title,
                    average,
                    imgUrl
                }
                allFilms.push(data)
                insertToMysql(data)
            })

            writeFileData(currentFileName, allFilms)
            console.log('文件存储成功')
            connection.end()

            // deleteFiles('./images')
            // await downloadImg(allFilms, start)
        })
    })
}

const insertToMysql = (data) => {
    connection.query('INSERT INTO douban_movie_top250 SET ?', data, function (error, results, fields) {
        if (error) throw error
    })
}

module.exports = getData