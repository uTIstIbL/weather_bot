const express = require('express');
const app = express();
const morgan = require('morgan')
const PORT = 3000
const pkg = require('./package.json');

// 請求機器人套件
const TelegramBot = require('node-telegram-bot-api');
const myToken = "8089640477:AAEuKz4Y1HERaV2ugGCVUU0Znw9LMb8EK04"

const bot = new TelegramBot(myToken)

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
bot.startPolling((msg,error)=>{
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,`哈囉！歡迎使用機師天氣查詢系統！
        以下是所有指令的使用表格：
        /airport ICAO
        /metar ICAO
        /taf ICAO 
        /dev 取得開發人員資料`)
})

bot.on('message', (msg,error) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        bot.sendMessage(chatId, `哈囉！歡迎使用機師天氣查詢系統！
        以下是所有指令的使用表格：
        /airport ICAO
        /metar ICAO
        /taf ICAO 
        /dev 取得開發人員資料`);
    } else {
        // 如果收到的訊息不是 "/start"，你可以選擇不回應，或提供指引
        // 比如這樣：
        if (!text.startsWith("/")) {
            bot.sendMessage(chatId, "請使用有效的指令。若要開始，請輸入 /start");
        }
    }
});


bot.on('message',async msg  => {
    const chatId = msg.chat.id;
    const text = msg.text
    const airportCode = text.slice(9).trim();
    // 取得天氣資料 API
    const axios = require('axios');
    const config = {
      method: 'get',
      url: `https://api.checkwx.com/station/${airportCode}?x-api-key=27a94ede1cb44287bc906ad311`,
    };

        // 檢查訊息是不是為空
        if(!text){
            console.error("訊息內容為空，無法發送")
        }
    
        const response =await axios(config)
        const airportData = response.data.data ? response.data.data[0] : null; 

        // 伺服器找不到資料
        if (!airportData) {
            bot.sendMessage(chatId, "很抱歉，伺服器找不到資料");
        }
    
        // 輸入 /airport IATA 應該要有的反應
        if (text === `/airport ${airportCode}`) {
            bot.sendMessage(chatId, `查詢到的機場為: ${airportData.icao} - 機場名稱: ${airportData.name} - 城市名稱: ${airportData.city}`);
        }
    }
)



app.listen(PORT, () => {
    console.log(`伺服器啟動在 http://localhost:${PORT}`)
})
