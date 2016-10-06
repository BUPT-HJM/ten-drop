//禁止touchmove
document.body.addEventListener('touchmove', function(event) {
	event.preventDefault();
}, false);

//fastclick
if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}

var menuButton = document.getElementById("menuButton");
var sideBar = document.getElementById("sideBar");
var mask = document.getElementById("mask");
menuButton.onclick = function() {
	sideBar.classList.toggle("open");
	mask.classList.toggle("show");
}
mask.onclick = function() {
	sideBar.classList.remove("open");
	mask.classList.remove("show");
}


var pastPlayTime;
var todayPlayTime = new Date();



var userData;
var config = {
	authDomain: "ten-drop.wilddog.com",
	syncURL: "https://ten-drop.wilddogio.com"
};
var defApp = wilddog.initializeApp(config);
var ref = wilddog.sync().ref();
var user_ref = ref.child('user');

var userImg = document.getElementById("userImg");
var levelRank = document.getElementById("levelRank");
var userNameP = document.getElementById("userName");

//canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;
var w = canvas.width;
var h = canvas.height;


//剩下的水滴
var leftDropNum = 10;
var leftDropSpan = document.getElementById("leftDrop");
var leftDropArr = ["NONE", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
for (var i = 11; i < 100; i++) {
	leftDropArr.push(i);
}

//获取页面各种元素
var infoP = document.getElementById("info");
var restartBtn = document.getElementById("restartBtn");
var levelP = document.getElementById("level");
var bestLevel = document.getElementById("bestLevel");
var todayBest = document.getElementById("todayBest");
var best = document.getElementById("best");
var loadBg = document.getElementById("loadBg");

//必要的游戏全局变量
var game = null;


/**
 * 水滴对象
 */
var Drop = function() {
	this.x = w / 2;
	this.y = h / 2;
	this.generation = 1;
	this.direction = null;
	//this.color = "#1BD369";
	this.colorArr = ["#43A6FF", "#1BD369", "#FF7575"];
}

Drop.prototype = {
	//集中的处理方法
	process: function() {
		this.chooseDraw();
	},
	//根据水滴的代来选择画的方法
	chooseDraw: function() {
		var colorIndex = (game.level - 1) % 3;
		this.color = this.colorArr[colorIndex];
		//console.log(colorIndex);
		switch (this.generation) {
			case 1:
				this.draw_1();
				break;
			case 2:
				this.draw_2();
				break;
			case 3:
				this.draw_3();
				break;
			case 4:
				this.draw_4();
				break;
			case 5:
				this.draw_5();
				break;
			default:
				break;
		}
	},
	draw_1: function() {
		EvenCompEllipse(ctx, this.x, this.y, 15, 20, this.color);
	},
	draw_2: function() {
		EvenCompEllipse(ctx, this.x, this.y, 30, 30, this.color);
	},
	draw_3: function() {
		EvenCompEllipse(ctx, this.x, this.y, 45, 35, this.color);
	},
	draw_4: function() {
		EvenCompEllipse(ctx, this.x, this.y, 50, 50, this.color);

	},
	draw_5: function() {
		var centerX = this.x;
		var centerY = this.y;

		if (this.direction == null) {
			this.generation = 6;
			EvenCompEllipse(ctx, this.x - 20, this.y, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x + 20, this.y, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x, this.y - 20, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x, this.y + 20, 10, 10, this.color);
		} else {
			EvenCompEllipse(ctx, this.x, this.y, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x, this.y, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x, this.y, 10, 10, this.color);
			EvenCompEllipse(ctx, this.x, this.y, 10, 10, this.color);
			return;
		}

		//左
		var drop_left = new Drop();
		drop_left.x = centerX - 20;
		drop_left.y = centerY;
		drop_left.generation = 5;
		drop_left.direction = "left";
		game.dropCollection.add_broken(drop_left);

		//右
		var drop_right = new Drop();
		drop_right.x = centerX + 20;
		drop_right.y = centerY;
		drop_right.generation = 5;
		drop_right.direction = "right";
		game.dropCollection.add_broken(drop_right);

		//上
		var drop_up = new Drop();
		drop_up.x = centerX;
		drop_up.y = centerY + 20;
		drop_up.generation = 5;
		drop_up.direction = "up";
		game.dropCollection.add_broken(drop_up);

		//下
		var drop_down = new Drop();
		drop_down.x = centerX;
		drop_down.y = centerY - 20;
		drop_down.generation = 5;
		drop_down.direction = "down";
		game.dropCollection.add_broken(drop_down);
	}
}


/**
 * 绘制椭圆
 */
function EvenCompEllipse(context, x, y, a, b, fillStyle) {
	context.save();
	context.fillStyle = fillStyle;
	//选择a、b中的较大者作为arc方法的半径参数
	var r = (a > b) ? a : b;
	var ratioX = a / r; //横轴缩放比率
	var ratioY = b / r; //纵轴缩放比率
	context.scale(ratioX, ratioY); //进行缩放（均匀压缩）
	context.beginPath();
	//从椭圆的左端点开始逆时针绘制
	context.moveTo((x + a) / ratioX, y / ratioY);
	context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI);
	context.closePath();
	context.fill();
	context.restore();
};


/**
 * 水滴上的盘子对象
 */
var Board = function() {
	this.w = canvas.width;
	this.h = canvas.height;
	this.hor = 6; //水平方向格子数
	this.ver = 6; //竖直方向格子数
	this.boardArr = [];
}

Board.prototype = {
	//初始化
	init: function() {
		for (var i = 0; i < this.hor; i++) {
			for (var j = 0; j < this.ver; j++) {
				var x = i * this.w / this.hor + this.w / this.hor / 2;
				var y = j * this.h / this.ver + this.h / this.ver / 2;
				var pos = {
					x: x,
					y: y
				}
				this.boardArr.push(pos);
			}
		}
		//this.draw();
	},
	//绘制（后面未使用）
	draw: function() {
		for (var i = 0; i <= this.hor; i++) {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(i * this.w / this.hor, 0);
			ctx.lineTo(i * this.w / this.hor, this.h);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
		for (var i = 0; i <= this.ver; i++) {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(0, i * this.h / this.ver);
			ctx.lineTo(this.w, i * this.h / this.ver);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}
}

/**
 * 水滴数组对象
 */
var DropCollection = function() {
	this.dropArr = [];
	this.brokenArr = [];
}
DropCollection.prototype = {
	//集中的处理方法
	process: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < this.dropArr.length; i++) {
			if (this.dropArr[i].generation == 6) {
				continue;
			}
			this.dropArr[i].process();
		}
		for (var i = 0; i < this.brokenArr.length; i++) {
			if (this.brokenArr[i].generation == 6) {
				continue;
			}
			this.brokenArr[i].process();
		}
	},
	//水滴数组add
	add: function(drop) {
		this.dropArr.push(drop);
	},
	//水滴数组remove
	remove: function(drop) {
		for (var i = 0; i < this.dropArr.length; i++) {
			if (this.dropArr[i] == drop) {
				this.dropArr.splice(i, 1);
			}
		}
	},
	//散开水滴数组add
	add_broken: function(drop) {
		this.brokenArr.push(drop);
	},
	//散开水滴数组remove
	remove_broken: function(drop) {
		for (var i = 0; i < this.brokenArr.length; i++) {
			if (this.brokenArr[i] == drop) {
				this.brokenArr.splice(i, 1);
			}
		}
	},
	//散开的水滴飞行逻辑处理函数
	fly: function(drop) {
		for (var i = 0; i < this.brokenArr.length; i++) {
			if (this.brokenArr[i].generation == 6) {
				continue;
			}
			if (this.isInto(this.brokenArr[i].x, this.brokenArr[i].y) || this.brokenArr[i].x < -5 || this.brokenArr[i].x > canvas.width + 5 || this.brokenArr[i].y > canvas.height + 5 || this.brokenArr[i].y < -5) {
				this.brokenArr[i].generation = 6;
				continue;
			}
			switch (this.brokenArr[i].direction) {
				case "left":
					this.brokenArr[i].x--;
					break;
				case "right":
					this.brokenArr[i].x++;
					break;
				case "up":
					this.brokenArr[i].y++;
					break;
				case "down":
					this.brokenArr[i].y--;
					break;
				default:
					break;
			}
		}
	},
	//判断散开的水滴是否击中
	isInto: function(x, y) {
		var board = game.board;
		var dropArr = game.dropCollection.dropArr;
		var i = Math.floor(x / (board.w / board.hor));
		var j = Math.floor(y / (board.h / board.ver));
		for (var k = 0; k < dropArr.length; k++) {
			if ((dropArr[k].x == (i * board.w / board.hor + board.w / board.hor / 2)) && (dropArr[k].y == (j * board.h / board.ver + board.h / board.ver / 2)) && (dropArr[k].generation <= 4)) {
				dropArr[k].generation++;
				if (dropArr[k].generation > 6) {
					dropArr[k].generation = 6;
				}
				return true;
			}
		}
		return false;
	}
}

/**
 * 游戏对象
 */
var Game = function() {
	this.board = null;
	this.dropCollection = null;
	this.gameStart = false;
	this.level = 1;
	this.pause = false;
	this.startTime = 0;
	this.endTime = 0;
	this.name = null;
}
Game.prototype = {
	//游戏初始化
	init: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var board = new Board();
		board.init();
		this.board = board;
		var dropCollection = new DropCollection();
		for (var i = 0; i < board.boardArr.length; i++) {
			var drop = new Drop();
			drop.generation = getNumberInRange(1, 4);
			drop.x = board.boardArr[i].x;
			drop.y = board.boardArr[i].y;
			dropCollection.add(drop);
		}
		leftDropSpan.innerHTML = leftDropArr[10];
		this.timeChange();
		this.dropCollection = dropCollection;
		this.clickSelect();
		//this.setBest();

		this.startTime = new Date().getTime();
		/*this.name = userData.connected_services.qzone.name;
		console.log(this.name);*/
	},
	//点击选中水滴增加代
	clickSelect: function() {
		var that = this;
		var board = this.board;
		canvas.onclick = function(e) {
			e.preventDefault();
			if (this.pause) {
				return;
			}
			if (leftDropNum == 0 || that.isGameOver()) {
				alert("Game over!");
				return;
			}
			that.gameStart = true;
			var i = Math.floor(e.offsetX / (board.w / board.hor));
			var j = Math.floor(e.offsetY / (board.h / board.ver));
			var dropArr = that.dropCollection.dropArr;
			for (var k = 0; k < dropArr.length; k++) {
				if ((dropArr[k].x == (i * board.w / board.hor + board.w / board.hor / 2)) && (dropArr[k].y == (j * board.h / board.ver + board.h / board.ver / 2))) {
					if (dropArr[k].generation >= 5) {
						continue;
					}
					dropArr[k].generation++;
					leftDropNum--;
					leftDropSpan.innerHTML = leftDropArr[leftDropNum];
					that.dropCollection.process();
				}
			}

		}
	},
	//时间渲染
	timeChange: function() {
		var that = this;
		if (this.gameStart && this.isGameOver() && !this.pause) {
			info.innerHTML = "You win! Try your best to go to next level!";
			this.pause = true;
			setTimeout(function() {
				that.nextLevel();
				that.pause = false;
			}, 1000);
		}
		if (leftDropNum == 0 && !this.isGameOver()) {
			info.innerHTML = "You lose!";
		}
		var that = this;
		setTimeout(function() {
			that.dropCollection.fly();
			that.dropCollection.process();
			that.timeChange();
		}, 4);
	},
	//判断是否游戏结束
	isGameOver: function() {
		var count = 0;
		var dropArr = this.dropCollection.dropArr;
		for (var k = 0; k < dropArr.length; k++) {
			if (dropArr[k].generation == 6) {
				count++;
			}
		}
		if (count == dropArr.length) {
			return true;
		} else {
			return false;
		}
	},
	//进入下一关
	nextLevel: function() {
		this.level++;
		levelP.innerHTML = "Level " + this.level;
		if (this.level > +bestLevel.innerHTML) {
			this.setBest(this.level);
		}
		if (this.level > +todayBest.innerHTML) {
			this.setBest(this.level, "today");
		}
		//userBest();



		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.gameStart = false;
		this.dropCollection = null;
		var board = this.board;
		var dropCollection = new DropCollection();
		var count = 0;
		for (var i = 0; i < board.boardArr.length; i++) {
			var drop = new Drop();
			//var change = Math.random();
			drop.generation = getNumberInRange(1, 4);
			count += drop.generation;

			drop.x = board.boardArr[i].x;
			drop.y = board.boardArr[i].y;
			dropCollection.add(drop);
		}
		var giveDrop;
		if (leftDropNum + 7 <= 20) {
			giveDrop = 7;
		} else {
			giveDrop = 20 - leftDropNum;
		}
		leftDropNum += giveDrop;
		leftDropSpan.innerHTML = leftDropArr[leftDropNum];
		info.innerHTML = "Try your best! Give you another " + giveDrop + " drop!";
		this.dropCollection = dropCollection;
	},
	setBest: function(level, flag) {
		var userName = /*userData.connected_services.qzone.name;*/ userData.name + "";
		var lev = level + "";
		var length = lev.length;
		for (var i = 0; i < 6 - length; i++) {
			lev = "0" + lev;
		}
		var p = new Date() + "";
		this.endTime = new Date().getTime();
		var time = this.endTime - this.startTime;
		//计算出相差天数
		var days = Math.floor(time / (24 * 3600 * 1000))

		//计算出小时数
		var leave1 = time % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
		var hours = Math.floor(leave1 / (3600 * 1000))

		//计算相差分钟数
		var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
		var minutes = Math.floor(leave2 / (60 * 1000))

		//计算相差秒数
		var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
		var seconds = Math.round(leave3 / 1000)

		if (flag == "today") {
			user_ref.child(userName).child("today").update({
				level: level,
				UA: navigator.userAgent,
				time: days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒",
				img: userImg.src,
				t: time,
				token: sjcl.encrypt(time + "", level + ""),
				rank: lev + '_' + (3000000000000 - time),
				playTime: p + "",
			})
			user_ref.child(userName).update({
				todayRank: lev + '_' + (3000000000000 - time)
			})
			todayBest.innerHTML = level;
			return;
		}


		user_ref.child(userName).update({
			//name: userName,
			level: level,
			UA: navigator.userAgent,
			time: days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒",
			t: time,
			token: sjcl.encrypt(time + "", level + ""),
			rank: lev + '_' + (3000000000000 - time),
			playTime: p + "",
			todayRank: lev + '_' + (3000000000000 - time)
				//id: userData.user_id
		})
		bestLevel.innerHTML = level;
	}
}

/**
 * 重新开始游戏
 */
restartBtn.onclick = function() {
	//location.reload();
	for (var i = 0; i < 99999; i++) {
		clearTimeout(i);
	}
	game = null;
	leftDropNum = 10;
	game = new Game();
	game.init();
}


/**
 * 返回返回内函数（辅助函数）
 */
function getNumberInRange(min, max) {
	var range = max - min;
	var r = Math.random();
	return Math.round(r * range + min)
}

/*
DUOSHUO.visitor.on('reset', function() {
	//console.log(this.data.user_id);
	var successCallback = function(data) {
		if (data.code == 0) {
			//console.log(data);
			userData = data.response;
			userImg.src = userData.avatar_url;
			userNameP.innerHTML = userData.name;
			//创建游戏实例，并且初始化
			game = new Game();
			game.init();
			userBest();
			getRank();
			getTodayRank();
		} else {
			location.href = "https://bupt-hjm.github.io/ten-drop/"
		}
	};
	var errorCallback = function(data) {
		location.href = "https://bupt-hjm.github.io/ten-drop/"
	};
	DUOSHUO.API.ajax('GET', 'users/profile', {
		"user_id": this.data.user_id
	}, successCallback, errorCallback);
});*/

userData = {
	name: "HJM",
	avatar_url: "http://tva1.sinaimg.cn/crop.0.5.750.750.50/005B3SLjjw8f855wmu71sj30ku0l5t9m.jpg",
	user_id: 2222
}
userImg.src = userData.avatar_url;
userNameP.innerHTML = userData.name;
//创建游戏实例，并且初始化
game = new Game();
game.init();
userBest();
getRank();
getTodayRank();

function userBest() {
	user_ref.once("value", function(user) {
		var userName = userData.name + "";
		var user = user.val();
		var p = new Date() + "";
		if (user[userName] == undefined) {
			bestLevel.innerHTML = 1;
			todayBest.innerHTML = 1;
			user_ref.child(userName).set({
				name: userName,
				level: 1,
				UA: navigator.userAgent,
				time: 0,
				t: 0,
				img: userImg.src,
				token: sjcl.encrypt(0 + "", 1 + ""),
				rank: 000000,
				playTime: p + "",
				id: userData.user_id,
				today: 1,
				todayRank: 000000
			});
		} else {
			bestLevel.innerHTML = user[userName].level;
			if (user_ref.child(userName).today == 1) {
				user_ref.child(userName).child("today").set({
					level: 1,
					UA: navigator.userAgent,
					time: 0,
					t: 0,
					token: sjcl.encrypt(0 + "", 1 + ""),
					rank: 000000,
					playTime: p + "",
				})
			} else {
				if ((user[userName].today == undefined) && (new Date(user[userName].playTime).toDateString() == new Date(todayPlayTime).toDateString())) {
					user_ref.child(userName).update({
						todayRank: user[userName].rank
					})
					user_ref.child(userName).child("today").set({
						level: user[userName].level,
						UA: user[userName].UA,
						time: user[userName].time,
						t: user[userName].t,
						token: user[userName].token,
						rank: user[userName].rank,
						playTime: user[userName].playTime
					})
					todayBest.innerHTML = user[userName].today.level;
					return;
				}
				if (user[userName].today == undefined) {
					user_ref.child(userName).set({
						level: user[userName].level,
						UA: user[userName].UA,
						time: user[userName].time,
						t: user[userName].t,
						token: user[userName].token,
						rank: user[userName].rank,
						playTime: user[userName].playTime,
						todayRank: 1
					})
					user_ref.child(userName).child("today").set({
						level: 1,
						UA: navigator.userAgent,
						time: 0,
						t: 0,
						token: sjcl.encrypt(0 + "", 1 + ""),
						rank: 000000,
						playTime: p + "",
					});

					return;
				}
				pastPlayTime = user[userName].today.playTime;
				if (new Date(pastPlayTime).toDateString() !== new Date(todayPlayTime).toDateString()) {
					user_ref.child(userName).child("today").update({
						level: 1,
						UA: navigator.userAgent,
						time: 0,
						t: 0,
						token: sjcl.encrypt(0 + "", 1 + ""),
						rank: 000000,
						playTime: p + ""
					})

				}

			}
			todayBest.innerHTML = user[userName].today.level;
		}
	})
}
var todayRankHtml = "";
var pastRankHtml = "";

function getRank() {
	user_ref.orderByChild('rank').limitToLast(8).on("value", function(users) {
		var userArr = [];
		var len = 8;
		users.forEach(function(user) {
			var item = user.val();
			try {
				userArr.unshift({
					img: item.img,
					name: item.name,
					level: item.level
				});
			} catch (err) {
				console.log(err);
			}
		});
		if (userArr.length < 8) {
			len = userArr.length;
		}
		pastRankHtml = "";
		for (var i = 0; i < len; i++) {
			pastRankHtml += "<p><span class='user-rank'>" + (i + 1) + "</span><img src=" + userArr[i].img + "><span class='user-rank-name'>" + userArr[i].name + "</span><span class='user-level'>level " + userArr[i].level + "</span></p>";
		}
	});
}


function getTodayRank() {
	user_ref.orderByChild('todayRank').limitToLast(100).on("value", function(users) {
		todayPlayTime = new Date() + "";
		var userArr = [];
		var len = 8;
		var k = 0;
		users.forEach(function(user) {
			var item = user.val();
			try {
				if (item.playTime !== undefined) {
					if (new Date(item.playTime).toDateString() == new Date(todayPlayTime).toDateString()) {
						userArr.unshift({
							img: item.img,
							name: item.name,
							level: item.level
						});
						k++;
					}
					if (k == 8) {
						return;
					}
				}
			} catch (err) {
				console.log(err);
			}
		});
		if (userArr.length < 8) {
			len = userArr.length;
		}
		todayRankHtml = "";
		for (var i = 0; i < len; i++) {
			todayRankHtml += "<p><span class='user-rank'>" + (i + 1) + "</span><img src=" + userArr[i].img + "><span class='user-rank-name'>" + userArr[i].name + "</span><span class='user-level'>level " + userArr[i].level + "</span></p>";
		}
		levelRank.innerHTML = todayRankHtml;
		loadBg.classList.add("hide");
	});
}

var switchButton = document.getElementById("switch");
var rankTitle = document.getElementById("rankTitle");
switchButton.onclick = function() {
	if (rankTitle.innerHTML == "今日实时排行榜") {
		levelRank.innerHTML = pastRankHtml;
		rankTitle.innerHTML = "历史排行榜";
		switchButton.innerHTML = "今日";
	} else {
		levelRank.innerHTML = todayRankHtml;
		rankTitle.innerHTML = "今日实时排行榜";
		switchButton.innerHTML = "历史";
	}
}






function a() {
	user_ref.orderByChild('rank').limitToLast(100).on("value", function(users) {
		todayPlayTime = new Date() + "";
		var userArr = [];
		users.forEach(function(user) {
			var item = user.val();
			/*if((item.today !== undefined)) {
				console.log(item);
			}*/




			if ((item.today == undefined) && (new Date(item.playTime).toDateString() == new Date(todayPlayTime).toDateString())) {
					console.log(item);
					/*user_ref.child(item.name).update({
						todayRank: item.rank
					})
					user_ref.child(item.name).child("today").set({
						level: item.level,
						UA: item.UA,
						time: item.time,
						t: item.t,
						token: item.token,
						rank: item.rank,
						playTime: item.playTime
					})*/
					//todayBest.innerHTML = user[userName].today.level;
			}
		});
	});
}