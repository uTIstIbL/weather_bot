const express = require('express');
const app = express();
const morgan = require('morgan')
const PORT = 3000
const pkg = require('./package.json');

// 請求機器人套件
const TelegramBot = require('node-telegram-bot-api');
const myToken = "8089640477:AAEuKz4Y1HERaV2ugGCVUU0Znw9LMb8EK04"

const bot = new TelegramBot(myToken, {polling: true})

// middleware
app.use(express.json());
app.use(morgan('Aaron'));
morgan.format('Aaron', '[Aaron] :method :url :status');
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
bot.onText('/start', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `哈囉！歡迎使用機師天氣查詢系統！
        以下是所有指令的使用表格：
        /airport ICAO
        /metar ICAO
        /taf ICAO 
        /dev 取得開發人員資料`);
});

bot.on('message',async msg  => {
    const chatId = msg.chat.id;
    const text = msg.text

    if (!text || !text.startsWith('/airport ')) {
        return; 
    }

    const airportCode = text.slice(9).trim(); // 提取 ICAO 代碼
    if (!airportCode) {
        bot.sendMessage(chatId, '請提供有效的 ICAO 代碼');
        return;
    }
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
    
        // 輸入 /airport ICAO 應該要有的反應
        if (text === `/airport ${airportCode}` || text === `/aiport`) {
            bot.sendMessage(chatId, `查詢到的機場為: ${airportData.icao} - 機場名稱: ${airportData.name} - 城市名稱: ${airportData.city}`);
        }
    }
)

bot.on('message',async msg => {
    const chatId = msg.chat.id;
    const text = msg.text
    
    if( text === "/dev"){
        bot.sendMessage(chatId, `開發人員名稱: Aaron
        開發人員GitHub: @uTIstIbL,
        開發人員網站: ronkao.tw,
        開發人員linkedin: www.linkedin.com/in/aaron-kao884b2319a`);
    }
})

app.listen(PORT, () => {
    console.log(`伺服器啟動在 http://localhost:${PORT}`)
})