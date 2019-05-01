var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

// app.stack(__dirname + '/index.html')

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
    console.log('listening on http://localhost:3000');
});

io.on('connection', function (socket) {
    socket.on('newUser', function (data, callback) {
        if (data in users) {
            callback(false);
        } else {
            callback(true);
            socket.neckName = data;
            users[socket.neckName] = socket;
            updateNickName();
        }
    });

    function updateNickName() {
        io.emit('userNames', Object.keys(users));
    }

    socket.on('sendMessage', function (name, data, callback) {
        if (name) {
            if (name in users) {
                users[name].emit('receiveMessage', { mess: data, nick: socket.neckName });
                users[socket.neckName].emit('mySelfMessage', { mess: data, nick: name });
            } else {
                callback('Error! please enter a user name for you friend');
            }
        } else {
            callback('Error! please enter a user name for you friend');
            users[socket.neckName].emit('newMessage', { mess: 'Error! please enter a user name for you friend', nick: socket.neckName });
        }
        // socket.broadcast.emit('newMessage',data);
    });

    socket.on('disconnect', function () {
        if (!socket.neckName) return;
        delete users[socket.neckName];
        updateNickName();
    })

});

