const { google } = require("googleapis");
const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');

// config env และ package
const env = dotenv.config().parsed
const app = express()

const lineConfig = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN,
    channelSecret: env.CHANNEL_SECRET
}

const client = new line.Client(lineConfig);

// Setting ส่วนของ Google
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
});

app.get("/", async (req, res) => {
    const authclient = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: authclient });
    const spreadsheetId = "1TFMBHX19EVQWgTZIruszDxIlXo5r1Oj4LYsQQTcutlM";
    const metaData = await googleSheets.spreadsheets.get({auth, spreadsheetId});

    //get ค่าแถวของ GS
    const getRows = await googleSheets.spreadsheets.values.get({auth, spreadsheetId, range: "data1"});

    //ใส่ข้อมูลลงแถวของ GS
    // await googleSheets.spreadsheets.values.append({
    //     auth,
    //     spreadsheetId,
    //     range: "data1!A:B",
    //     valueInputOption: "USER_ENTERED",
    //     resource: {
    //         values: [["Test101", "102"]]
    //     }
    // });

    // let abc = getRows.data.values;
    // let x 
    // for (var i=0;i<abc.length; i++){
    //     console.log(getRows.data.values[i])
    //     x = getRows.data.values[i]
    // }

    // res.send(x);
    
});

// ฟังชั่นหลัก
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events
        console.log('event', events)
        return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK")
    } catch (e) {
        res.status(500).end()
    }
});

//คำสั่งเรียกใช้งาน 
const prefix = '!';
let replyLineMessage

// ฟังชั่นรอง
const handleEvent = async (event) => {

    // ส่วนของ Google
    const authclient = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: authclient });
    const spreadsheetId = "1TFMBHX19EVQWgTZIruszDxIlXo5r1Oj4LYsQQTcutlM";

    // get ค่าแถวของ GS
    const getRows = await googleSheets.spreadsheets.values.get({auth, spreadsheetId, range: "data1"});

    // เช็คข้อมูล
    if(event.type !== 'message' || event.message.type !== 'text' || !event.message.text.startsWith(prefix)) return null;
    // เริ่มทำงานในโต้ตอบ
    else if (event.type === 'message') {   

        // คำสั่งเรียกใช้งาน 
        const args = event.message.text.trim().split(/ +/g);
        const cmd = args[0].slice(prefix.length).toLowerCase();       

        // ตัวแปลเก็บข้อมูลจาก GS และ เก็บค่าเช็ค
        let x, y
        let z = true;

        // เช็คข้อมูลว่าตรงกับ GS หรือเปล่า
        for (var i=0;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] != args[1]) {
                z = false;     
            }
        }

        for (var i=0;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] == args[1]) {
                x=getRows.data.values[i][1]
                y=getRows.data.values[i][2]
                z = true;     
            }
        }

        // Message Box สินค้าทั้งหมด
        let msg1 = {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
                "type": "bubble",
                "styles": {
                    "footer": {
                        "separator": true
                    }
                },
                "hero": {
                    "type": "image",
                    "url": "https://i.pinimg.com/564x/c8/55/ae/c855aea64c62ef90a746df8d1670b017.jpg",
                    "size": "full",
                    "aspectRatio": "1.51:1",
                    "aspectMode": "fit",
                    "backgroundColor": "#000000FF"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "backgroundColor": "#121212",
                    "contents": [
                        {"type": "text", "text": "รายการสินค้า", "weight": "bold", "color": "#ffdab9", "size": "sm"},
                        {"type": "text", "text": "สินค้าทั้งหมด", "weight": "bold", "color": "#ffffff", "size": "xxl", "margin": "md"},
                        {"type": "separator", "margin": "xxl"},
                        {"type": "box", "layout": "vertical", "margin": "xxl", "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box", "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "ชื่อสินค้า", "size": "lg", "color": "#ffffff", "weight": "bold", "flex": 0},
                                        {"type": "text", "text": "สต๊อก", "size": "lg", "color": "#ffffff", "weight": "bold", "align": "end"},
                                    ],
                                },
                                {"type": "separator", "margin": "md", "color": "#121212"},
                                {
                                    "type": "box", "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "น้ำอัดลมA", "size": "sm", "color": "#ffffff", "flex": 0},
                                        {"type": "text", "text": "120", "size": "sm", "color": "#ffffff", "align": "end"}
                                    ]
                                },
                                {
                                    "type": "box", "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "น้ำอัดลมB", "size": "sm", "color": "#ffffff", "flex": 0},
                                        {"type": "text", "text": "210", "size": "sm", "color": "#ffffff", "align": "end"},
                                    ],
                                },
                                {
                                    "type": "box", "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "น้ำอัดลมC", "size": "sm", "color": "#ffffff", "flex": 0},
                                        {"type": "text", "text": "300", "size": "sm", "color": "#ffffff", "align": "end"}
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "flex": 0,
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                    "type": "uri",
                                    "label": "เพิ่มเติม",
                                    "uri": "https://docs.google.com/spreadsheets/d/1TFMBHX19EVQWgTZIruszDxIlXo5r1Oj4LYsQQTcutlM/"
                                },
                            "color": "#ffdab9",
                            "height": "md",
                            "style": "secondary"
                            }]
                        }
                    ]
                },
            }
        } 

        // Message Box สินค้าแต่ละชิ้น
        let msg2 = {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
                "type": "bubble",
                "styles": {
                    "footer": {"separator": true}
                },
                "hero": {
                    "type": "image",
                    "url": "https://airnfts.s3.amazonaws.com/nft-images/20210525/Shiba_Inu_dance_01_1621967952817.gif",
                    "size": "full",
                    "aspectRatio": "1.51:1",
                    "aspectMode": "fit",
                    "backgroundColor": "#000000FF"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "backgroundColor": "#121212",
                    "contents": [
                        {"type": "text", "text": "รายการสินค้า", "weight": "bold", "color": "#ffdab9", "size": "sm"},
                        {"type": "text", "text": args[1], "weight": "bold", "color": "#ffffff", "size": "xxl", "margin": "md"},
                        {"type": "separator", "margin": "xxl"},
                        {"type": "box", "layout": "vertical", "margin": "xxl","spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "จำนวน", "size": "sm", "color": "#ffffff", "flex": 0},
                                        {"type": "text", "text": ""+x, "size": "sm", "color": "#ffffff", "align": "end"},
                                    ],
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {"type": "text", "text": "ราคา", "size": "sm", "color": "#ffffff", "flex": 0},
                                        {"type": "text", "text": ""+y, "size": "sm", "color": "#ffffff", "align": "end"}
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "flex": 0,
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                    "type": "uri",
                                    "label": "รายการอื่น",
                                    "uri": "https://docs.google.com/spreadsheets/d/1TFMBHX19EVQWgTZIruszDxIlXo5r1Oj4LYsQQTcutlM/"
                                },
                            "color": "#ffdab9",
                            "height": "md",
                            "style": "secondary"
                            }]
                        }
                    ]
                }
            }
        } 

        // เริ่มคำสั่ง
        switch (cmd){
            case "stock": 
                replyLineMessage = msg1  
                break
            case "cst":
                if (args[1]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอกข้อมูลที่ต้องการค้นหา"}
                    break
                }
                if (z!=true) replyLineMessage = {"type": "text", "text": "ไม่พบข้อมูลที่ต้องการตรวจสอบ" }
                else replyLineMessage = msg2 
                break
            default:
                replyLineMessage = {"type": "text", "text": "ไม่พบคำสั่ง"}
                break
        }

        // ส่งข้อมูลกลับไปยังฟังชั่นหลัก
        return client.replyMessage(event.replyToken, replyLineMessage)
    }
}
const PORT = process.env.PORT || 3000;

//รันบน localhost

// app.listen(4000, () => {
//     console.log(`listening on 4000`)
// })

// รันบน server

app.listen(PORT, () => {
    console.log(PORT);
    console.log(`listening on Port ${PORT}`);
})