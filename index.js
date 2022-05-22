const express = require('express');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const PORT = process.env.PORT || 5000;

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
            break
        }
        console.log(msg);
    });
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
            client.send(`Пользователь ${msg.username} подключился`);
        }    
    });
}