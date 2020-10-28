const fs = require('fs')

// 将数据写入新的文件
const writeFileData = (file, data) => {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data')
    }

    fs.writeFileSync('./data/' + file, JSON.stringify(data))
}

// 删除文件夹下的所有文件, path 为文件夹路径
function deleteFiles(path) {
    let files = []
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        console.log(files)
        files.forEach((file) => {
            let curPath = path + '/' + file
            if (fs.statSync(curPath).isDirectory()) {
                deleteFiles(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
    }
}

// 下载图片保存
const downloadImg = async (allFilms, start = 0, path) => {
    allFilms.map((item, index) => {
        https.get(item.imgUrl, res => {
            res.setEncoding('binary')

            let imgStr = ''
            res.on('data', chunk => {
                imgStr += chunk
            })
            res.on('end', async () => {
                await fs.writeFile(`./images/${path}/${index + start}.png`, imgStr, 'binary', function (err) {
                    if (!err) {
                        console.log(`第${index + start}张图片保存成功`)
                    }
                })
            })
        })
    })
}

module.exports = {
    writeFileData,
    deleteFiles
}