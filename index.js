const express = require('express');
const app = express();
const morgan = require('morgan')
const PORT = 3000
const pkg = require('./package.json');

// 請求機器人套件
const TelegramBot = require('node-telegram-bot-api');
const myToken = "8089640477:AAEuKz4Y1HERaV2ugGCVUU0Znw9LMb8EK04"
const bot = new TelegramBot(myToken, {polling: true})

// 取得天氣資料 API
const axios = require('axios');
const { restart } = require('nodemon');
const URL = "https://aviationweather.gov/data/api/"

// middleware
app.use(express.json());
app.use(morgan('Aaron'))
morgan.format('[Aaron] :method :url :status'),
morgan.token('from', function(req, res){
    return req.query.from || '-';   
})

// app index
app.get("*", async (req,res) => {
    res.status(200).json({
        "name": pkg.name,
        "version": pkg.version
    })
})

// bot start
bot.startPolling({restart:true},(msg,error)=>{
    const chatId = msg.chat.id;

    try {
        bot.sendMessage(chatId,`哈囉！歡迎使用機師天氣查詢系統！
        以下是所有指令的使用表格：
        /airport 取得機場天氣資料
        /metar 取得meTARs
        /taf 取得 taf `)
    } catch (error) {
        bot.sendMessage(msg.chat.id,"啟動機器人失敗，請使用 /Start 來啟動天氣查詢機器人");
    }
})

bot.on('message', (msg,error) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
        if(text === "/start"){
            bot.sendMessage(chatId,`哈囉！歡迎使用機師天氣查詢系統！
            以下是所有指令的使用表格：
            /airport 取得機場天氣資料
            /metar 取得meTARs
            /taf 取得 taf `)
        } else {
            bot.sendMessage(msg.chat.id,"啟動機器人失敗，請使用 /Start 來啟動天氣查詢機器人");
        }
    } catch (error) {
        console.error(error)
    }
});

app.listen(PORT, () => {
    console.log(`伺服器啟動在 http://localhost:${PORT}`)
})
