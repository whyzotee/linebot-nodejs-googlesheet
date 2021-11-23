const { google } = require("googleapis");
const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');

const env = dotenv.config().parsed
const app = express()

const lineConfig = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN,
    channelSecret: env.CHANNEL_SECRET
}

const client = new line.Client(lineConfig);


app.get("/", async (req, res) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient();

    const googleSheets = google.sheets({version: "v4", auth: client });

    const spreadsheetId = "1TFMBHX19EVQWgTZIruszDxIlXo5r1Oj4LYsQQTcutlM";

    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId
    });

    //get ค่าแถวของ GS
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "data1"
    })

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "data1!A:B",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [["Test101", "102"]]
        }
    })
    
    res.send(getRows.data);
});

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events
        console.log('event=>>>>', events)
        return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK")
    } catch (e) {
        res.status(500).end()
    }
});

let replyLineMessage
const handleEvent = async (event) => {
    if(event.type !== 'message' || event.message.type !== 'text') return null;
    else if (event.type === 'message') {
        switch (event.message.text){
            case "สีเหลือง":
                replyLineMessage = "Yellow!"
                break
            case "มะม่วง":
                replyLineMessage = "Mango!"
                break
            default:
                return null
        }
        
        return client.replyMessage(event.replyToken,{type:'text',text:replyLineMessage})
    }
}
const PORT = process.env.PORT || 3000;

//รันบน localhost

// app.listen(4000, () => {
//     console.log(`listening on 4000`)
// })

app.listen(PORT, () => {
    console.log(PORT);
    console.log(`listening on Port ${PORT}`);
})