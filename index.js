const express = require('express');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const fs = require('fs');

app.use(cors());
app.use(express.json());

app.ws('/', (ws, req) => {
    console.log(`ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО`);
    //отправка сообщение в ответ на подключение
    ws.send('Ты успешно подключился');
    //слушатель сообщений
    ws.on('message', (msg) => {
        msg = JSON.parse(msg);
        switch(msg.method) {
            case "connection":
                connectionHandler(ws, msg);
                break;
            case "draw":
                broadcastConnection(ws, msg);
                break;
        }
        //console.log(msg);
    });
});

//слушатель пост запросов
app.post('/image', (req, res)=> {
    try {
        const data = req.body.img.replace('data:image/png;base64,', '');
        //сохранение файла
        fs.writeFileSync(__dirname+'/files/'+`${req.query.id}.jpg`, data, 'base64');
        return res.status(200).json({message:'успех'});
    } catch (e) {
        console.log(e);
        return res.status(500).json('error');
    }
});

//слушатель гет запросов
app.get('/image', (req, res)=>{
    try {
        //чтение файла
        const file = fs.readFileSync(__dirname+'/files/'+`${req.query.id}.jpg`);
        const data = 'data:image/png;base64,' + file.toString('base64');
        //возрат файла клиенту
        res.json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json('error');
    }
});

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));

const connectionHandler = (ws, msg) => {
    //устанавливаем айди подключившегося клиента для сокета
    ws.id = msg.id;
    broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
    //Перебираем список подключенных сокетов(клиентов)
    //и проверяем есть ли среди них тот айди который только что подключился
    aWss.clients.forEach(client => {
        if(client.id === msg.id) {
            //отправка сообщение клиентам
            client.send(JSON.stringify(msg));
        }    
    });
}