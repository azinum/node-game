/* server.js */
/* author: Azinum */
/* date: 2016/10/18 */

var express = require("express");
var Server = require("http").Server;
var session = require("express-session");
var app = express();
var server = Server(app);
var io = require("socket.io")(server);
var fs = require("fs");
var json = require("jsonfile");

app.use(express.static(__dirname + "/static"));

app.get("/", function(req, res, next) {
    res.sendFile(__dirname + req);
});

/* public data */
var world = {
    entities : {},
    users_peeked : 0
}

var config = {
    speed : 10,
    fps : 60,
}


var Server = function() {

    io.on("connect", function(socket) {
        var client = {
            id : world.users_peeked,
            pos : [
                Math.round(Math.random() * 300),
                Math.round(Math.random() * 200)
            ],
            w : 40,
            h : 40,
            speed : [0, 0],
            color : "black",
            name : "Guest(" + world.users_peeked + ")"
        }

        var init = function() {
            console.log("User connected");
            world.entities[world.users_peeked++] = client;
            io.sockets.emit('update', world);
        }

        socket.on("disconnect", function() {
            console.log("User disconnected");
            delete world.entities[client.id];
            io.sockets.emit('update', world);
        });

        /* user sent command */
        socket.on("command", function(string) {
            /* command : "arg" */
            data = string.split(" ");
            switch (data[0]) {
                case "update": {
                    socket.emit("update", world);
                }
                    break;

                case "update_entities": {
                    socket.emit("update_entities", world.entities);
                }
                    break;

                case "name": {
                    if (string.length < 27) {
                        world.entities[client.id].name = string.substring((string.length - (string.length - data[0].length)));
                    } else {
                        world.entities[client.id].name = "Name too long";
                    }
                    io.sockets.emit('update', world);   /* update name to everyone */
                }
                    break;

                case "color": {
                    world.entities[client.id].color = string.substring((string.length - (string.length - data[0].length))+1);
                    io.sockets.emit('update', world);   /* update name to everyone */
                }
                    break;

                default:
                    break;
            }
        });

        socket.on("input", function(data) {
            if (data[65]) {     /* A */
                world.entities[client.id].pos[0] -= config.speed;
            }
            if (data[68]) {     /* D */
                world.entities[client.id].pos[0] += config.speed;
            }
            if (data[87]) {     /* W */
                world.entities[client.id].pos[1] -= config.speed;
            }
            if (data[83]) {     /* S */
                world.entities[client.id].pos[1] += config.speed;
            }
            io.sockets.emit("move", {id : client.id, pos : world.entities[client.id].pos});
        });

        init();
    });
    server.listen(5000);
}

server = new Server();
