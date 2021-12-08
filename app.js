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

// ฟังชั่นหลัก
app.post('/webhook', line.middleware(lineConfig), async (req, res, next) => {
    try {
        const events = req.body.events
        console.log('event', events)
        events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK");

        if (req.session.user) return next(); 
        return next(new NotAuthorizedError());
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
    if(event.type !== 'message' || event.message.type !== 'text') return null;
    
    // เริ่มทำงานในโต้ตอบ
    else if (event.message.text.startsWith(prefix)) {   

        // คำสั่งเรียกใช้งาน 
        const args = event.message.text.trim().split(/ +/g);
        const cmd = args[0].slice(prefix.length).toLowerCase();       

        // ตัวแปลเก็บข้อมูลจาก GS และ เก็บค่าเช็ค
        let x, y, sheet
        let z, t = true;

        // เช็คข้อมูลว่าตรงกับ GS หรือเปล่า
        for (var i=1;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] != args[1]) {
                // เช็คว่ามีข้อมูลอยู่หรือเปล่า
                z = false;    
                
                // เช็คเพิ่มสินค้า
                t = true;
            }
        }

        for (var i=1;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] == args[1]) {
                x = getRows.data.values[i][1]
                y = getRows.data.values[i][2]
                z = true; 
                t = false;   
                sheet = i;
            }
        }
        
        // Message Box สินค้าทั้งหมด
        let msg1 =  
        {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
                "type": "carousel",
                "contents": [{
                    "type": "bubble",
                    "styles": {
                        "footer": {
                            "separator": true
                        }
                    },
                    "hero": {
                        "type": "image",
                        "url": "https://www.somjitpanich.com/wp-content/uploads/2020/06/8996001355923.jpg",
                        "size": "full",
                        "aspectRatio": "1.51:1",
                        "aspectMode": "fit",
                        "backgroundColor": "#FFFFFF"
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
                                            {"type": "text", "text": "ชื่อสินค้า", "size": "lg", "color": "#ffffff", "weight": "bold", "align": "start"},
                                            {"type": "text", "text": "สต๊อก", "size": "lg", "color": "#ffffff", "weight": "bold", "align": "center"},
                                            {"type": "text", "text": "ราคา", "size": "lg", "color": "#ffffff", "weight": "bold", "align": "end"}
                                        ],
                                    },
                                    {"type": "separator", "margin": "md", "color": "#121212"},
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[1][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[1][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[1][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[2][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[2][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[2][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ],
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[3][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[3][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[3][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[4][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[4][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[4][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[5][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[5][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[5][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                // กล่องข้อความที่2
                {
                    "type": "bubble",
                    "styles": {
                        "footer": {
                            "separator": true
                        }
                    },
                    "hero": {
                        "type": "image",
                        "url": "https://ocs-k8s-prod.s3.ap-southeast-1.amazonaws.com/product/302107.jpg",
                        "size": "full",
                        "aspectRatio": "1.51:1",
                        "aspectMode": "fit",
                        "backgroundColor": "#FFFFFF"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "backgroundColor": "#121212",
                        "contents": [
                            {"type": "text", "text": "รายการสินค้า", "weight": "bold", "color": "#ffdab9", "size": "sm"},
                            {"type": "text", "text": "หน้า 2", "weight": "bold", "color": "#ffffff", "size": "xxl"},
                            {"type": "separator", "margin": "xxl"},
                            {"type": "box", "layout": "vertical", "margin": "xxl", "spacing": "sm",
                                "contents": [
                                    //{"type": "separator", "margin": "md", "color": "#121212"},
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[6][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[6][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[6][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[7][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[7][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[7][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ],
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[8][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[8][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[8][2], "size": "sm", "color": "#ffffff", "align": "end"}
                                        ]
                                    },
                                    {
                                        "type": "box", "layout": "horizontal",
                                        "contents": [
                                            {"type": "text", "text": getRows.data.values[9][0], "size": "sm", "color": "#ffffff", "align": "start"},
                                            {"type": "text", "text": getRows.data.values[9][1], "size": "sm", "color": "#ffffff", "align": "center"},
                                            {"type": "text", "text": getRows.data.values[9][2], "size": "sm", "color": "#ffffff", "align": "end"}
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
                    }
                }
            ]
            },           
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
            case "ckst":
                if (args[1]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอกข้อมูลที่ต้องการค้นหาครับ"}
                    break
                }
                if (z!=true) replyLineMessage = {"type": "text", "text": "ไม่พบข้อมูลที่ต้องการตรวจสอบครับ" }
                else replyLineMessage = msg2
                break
            case "adst":
                if (t==false){
                    replyLineMessage = {"type": "text", "text": "มีสินค้านี้อยู่แล้วโปรดใช้ !upst เพื่อเพิ่มข้อมูลครับ"}
                    break
                }
                if (args[1]==null){
                    replyLineMessage = {"type": "text", "text": "โปรดกรอกข้อมูลที่ต้องการเพิ่ม ตัวอย่างเช่น !adst ชื่อสินค้า จำนวน ราคา"}
                    break
                }else if (args[2]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอก จำนวน สินค้า ตัวอย่างเช่น !adst ชื่อสินค้า จำนวน ราคา"}
                    break
                }else if (args[3]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอก ราคา สินค้า ตัวอย่างเช่น !adst ชื่อสินค้า จำนวน ราคา"}
                    break
                }

                // เพิ่มข้อมูลลงแถวของ GS
                await googleSheets.spreadsheets.values.append({auth, spreadsheetId, range: "data1!A:C", valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [[args[1], args[2], args[3]]]
                    }
                });

                replyLineMessage = {"type": "text", "text": "เพิ่มสินค้าลงในคลังเรียบร้อยแล้วค้าบ >_<" }
                break
            case "upst":
                if (z!=true){
                    replyLineMessage = {"type": "text", "text": "ไม่พบข้อมูลที่ต้องการเพิ่มครับ"}
                    break
                }
                if (args[1]==null){
                    replyLineMessage = {"type": "text", "text": "โปรดกรอกข้อมูลที่ต้องการอัพเดท ตัวอย่างเช่น !upst ชื่อสินค้า จำนวน ราคา"}
                    break
                }else if (args[2]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอก จำนวน สินค้า ตัวอย่างเช่น !upst ชื่อสินค้า จำนวน ราคา"}
                    break
                }else if (args[3]==null) {
                    replyLineMessage = {"type": "text", "text": "โปรดกรอก ราคา สินค้า ตัวอย่างเช่น !upst ชื่อสินค้า จำนวน ราคา"}
                    break
                }

                let updatedata = parseInt(args[2])+parseInt(x);
                // อัพเดทข้อมูลลงแถวของ GS
                await googleSheets.spreadsheets.values.update(
                    {auth, spreadsheetId, range: `data1!A${sheet+1}:C${sheet+1}`, valueInputOption: "USER_ENTERED", 
                    resource:{range: `data1!A${sheet+1}:C${sheet+1}`, majorDimension: "ROWS", values: [[`${args[1]}`, `${updatedata}`, `${args[3]}`]] }
                });

                replyLineMessage = {"type": "text", "text": "อัพเดทข้อมูลเรียบร้อยแล้วค้าบบบ" }
                break
            case "help":
                replyLineMessage = {"type": "text", "text": "!stock , !ckst, !adst, !upst"}
                break
            default:
                replyLineMessage = {"type": "text", "text": "ไม่พบคำสั่ง โปรดลองพิม !help เพื่อดูคำสั่งครับ"}
                break
        }

        // ส่งข้อมูลกลับไปยังฟังชั่นหลัก
        return client.replyMessage(event.replyToken, replyLineMessage);

    // พิมหาบอทที่ไม่ใช่ command
    } else {
        let msg;
        let usermsg = ["มี", "ใช่"]
        let replymsgX = ["ต้องการใช้งานบอทหรอครับ? (โปรดพิม ใช่ ถ้าต้องการใช้งานครับ)", "มีอะไรให้ช่วยไหมครับ >_< (โปรดพิม มี ถ้าต้องการใช้งานครับ)"]
        let replymsgY = ["โปรดพิม !help ครับ", "พิม !help ดูสิ!", "พิม !help เพื่อดูคำสั่งครับ"]

        for (let i=0; i < usermsg.length; i++) {
            if (!event.message.text.includes(usermsg[i])) {
                check = false;
            }
        }

        for (let i=0; i < usermsg.length; i++) {
            if (event.message.text.includes(usermsg[i])) {
                msg = {"type": "text", "text": replymsgY[Math.floor(Math.random()*replymsgY.length)] };
                check = true;
            }
        }

        if (check == false) {
            switch (event.message.text) {
                case "สีเหลือง" :
                    msg = {"type": "text", "text": "Yellow!"};
                    break
                case "มะม่วง" :
                    msg = {"type": "text", "text": "Mango!"};
                    break
                 case "ห้ะ" :
                    msg = {"type": "text", "text": "ห้ะ!"};
                    break
                default :
                    msg = {"type": "text", "text": replymsgX[Math.floor(Math.random()*replymsgX.length)] };
                    break
            }  
        }

        return client.replyMessage(event.replyToken, msg);
    }
}
const PORT = process.env.PORT || 3000;

//รันบน localhost

// app.listen(4000, () => {
//     console.log(`listening on 4000`);
// });

// รันบน server

app.listen(PORT, () => {
    console.log(PORT);
    console.log(`listening on Port ${PORT}`);
});