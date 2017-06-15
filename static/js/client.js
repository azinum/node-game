/* client.js */
/* author: Azinum */
/* date: 2016-10-19*/

var app = angular.module('myApp', []);

app.controller("main", function($scope) {
    $scope.socket = io.connect();
    $scope.canvas = document.getElementById("canvas");
    $scope.ctx = $scope.canvas.getContext("2d");
    $scope.canvas.height = window.innerHeight;
    $scope.canvas.width = window.innerWidth;
    $scope.canvas.focus();
    $scope.input = "";

    $scope.config = {
        fps : 60,
        tick : 60
    }

    $scope.keys = {};

    $scope.world = {
        entities : {}
    };

    document.getElementById("canvas").addEventListener("keydown", function(e) {
		$scope.keys[e.keyCode] = 1;
	});
	document.getElementById("canvas").addEventListener("keyup", function(e) {
		$scope.keys[e.keyCode] = 0;
	});

    $scope.emit = function(msg, data) {
        $scope.socket.emit(msg, data);
    }

    $scope.send_command = function() {
        $scope.socket.emit("command", $scope.input);
        $scope.input = "";
        $scope.canvas.focus();
    }

    $scope.render = function() {
        $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
        for (var i in $scope.world.entities) {
            var entity = $scope.world.entities[i];
            $scope.ctx.font = "12px monospace";
            $scope.ctx.strokeText(entity.name, entity.pos[0] - (entity.name.length), entity.pos[1] - 18);
            $scope.ctx.fillStyle = entity.color;
            $scope.ctx.fillRect(entity.pos[0], entity.pos[1], entity.w, entity.h);
        }
    }

    $scope.keyevents = function() {
        $scope.socket.emit("input", $scope.keys);
    }

    $scope.netupdate = function() {
        $scope.socket.emit("command", "update");
        setInterval(function() {
            $scope.keyevents();
            // $scope.socket.emit("command", "update_entities");
        }, 1000 / $scope.config.tick);
    }

    /*
    ** update world
    */
    $scope.socket.on("update", function(data) {
        console.log("Updated world");
        $scope.world = data;
    });

    /*
    ** update entities
    */
    $scope.socket.on("update_entities", function(data) {
        console.log("Updated entities");
        $scope.world.entities = data;
    });

    /* move: {id : Int, x : Int, y : Int}*/
    $scope.socket.on("move", function(data) {
        $scope.world.entities[data.id].pos = data.pos;
    });

    $scope.main = function() {
        $scope.netupdate();
        setInterval(function() {

            $scope.render();
            $scope.$apply();     /* update angular elements */
        }, 1000 / $scope.config.fps);
    }

    $scope.main();
});
