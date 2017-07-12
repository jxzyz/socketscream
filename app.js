//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , db = require('./dbhelper/db');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 所有屏幕信息
var screenArr = {};

//设置日志级别
io.set('log level', 1);

io.on('connection', function (socket) {

    // 对message事件的监听
    socket.on('message', function(key) {

        screenArr[key] = {
            id: '111',
            name: '张xx',
            gender:'男',
            department:'未设',
            screenNum: key
        };
/*
        screenArr[key]['send'] = function () {
            var key = this.screenNum;
            screenArr[key]['text'] = '222';
            socket.emit('system', socreenArr[key]);
        };//需要改写的部分
*/
/*        screenArr[key]['send'] = function(type,data){
            var key = this.screenNum;
            if(type=='pic')
            {
                screenArr[key]['text'] = "<img src = '/image/"+data+".jpg'/>";
                screenArr[key]['type'] = "图片";
            }
            if(type=='text')
            {
                screenArr[key]['text'] = "<h1>"+data+"</h1>";
                screenArr[key]['type'] = "文字";
            }
            console.log(screenArr[key]['text']);
            socket.emit('system',screenArr[key]);
        }
*/
        screenArr[key]['send'] = function(arr){
            var key = this.screenNum;
            screenArr[key]['id'] = arr.id;
            screenArr[key]['name'] = arr.name;
            screenArr[key]['gender'] = arr.gender;
            screenArr[key]['department'] = arr.department;
            socket.emit('system',screenArr[key]);
        }

        socket.emit('system', screenArr[key]);

        //监听出退事件
        socket.on('disconnect', function () {

            console.log('Disconnect');
        });

    });

    // 客户 socket
    socket.emit('open');//通知客户端已连接

});

//express基本配置
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine','ejs');
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));//静态文件全放在这里
});

// 路由
app.get('/', function(req, res){
  res.sendfile('views/screen.html');
});

app.get('/manage', function(req, res){
  res.sendfile('views/manage.html');
});

// 控制器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/manage/change', function(req, res) {

    var body = req.body;
    var n = body.n;
    console.log('点击' + n);
    screenArr[n].send();
    console.log(screenArr);
    res.send({
        err: 0,
        msg: 'ok'
    });
});
app.post('/manage/sub',function(req,res){

    var body = req.body;

    console.log(body);
    var arr = new Array();
    arr[0] = body.event;
    arr[1] = body.type;
    arr[2] = body.content;
//    console.log(arr);

//    console.log(arr);
    db.insert('person',arr);
    res.send({
        err:0,
        msg:'ok'
    });
});
app.post('/manage',function(req,res){
    var body = req.body;
    var num = body.num;
    var con = body.content;
    db.GetName(con,function(dat){
        var instant = dat;
        if(instant.err){
            console.log('未找到此项');
        }
        else{
            if(num=='all')
            {
                for(var i=1;i<11;i++)
                {
                    if(screenArr[i])
                    {
                        console.log(i);
                        screenArr[i].send(instant.type,instant.content);
                    }
                    else
                        console.log('第'+i+'屏未启动');
                }
            }else if(screenArr[num])
                screenArr[num].send(instant.type,instant.content);
            else
                console.log('该屏未启动');
        }
    });
});

app.get('/check',function(req,res){
    var result;
    db.FindAll(function(dat){
        result=dat;
        console.log(result);
        var htmlhead="<html><head><title>详细</title></head><body><table><tr><th>名称</th><th>类型</th><th>内容</th></tr>";
        var htmltail="</table></body></html>";
        for(var i=0;i<result.length;i++)
        {
            if(result[i].type=='text')
                var temp="<tr><td>"+result[i].name+"</td><td>"+result[i].type+"</td><td>"+result[i].content+"</td></tr>";
            else if(result[i].type=='pic')
                var temp="<tr><td>"+result[i].name+"</td><td>"+result[i].type+"</td><td><img src='/image/"+result[i].content+".jpg'></td></tr>";
            htmlhead+=temp;
        }
        var html=htmlhead+htmltail;
        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        res.write(html);
        res.end();

    });


});

app.get('/year',function(req,res){
    var result;
    db.FindYear(function(dat){
        result = dat;
        console.log(result);
        res.render('year',{
            year:result
        });
    });
});
app.get('/item',function(req,res){
    var year = req.query.year;
    var result;
    db.FindItem(year,function(dat){
        result = dat;
        console.log(result);
        res.render('item',{
            item:result,
            year:year
        });
    });
});
app.get('/prize',function(req,res){
    var year = req.query.year;
    var item = req.query.item;
    db.FindPrize(year,item,function(dat){
        result = dat;
        console.log(result);
        res.render('prize',{
            year:year,
            item:item,
            prize:result
        });
    });
});
app.get('/person',function(req,res){
    var year = req.query.year;
    var item = req.query.item;
    var detail = req.query.prize;
    var time;//需要轮转的次数
    var residual;//除10以后剩余的次数
    db.FindPerson(year,item,detail,function(dat){
        result = dat;
        console.log(result);
        res.render('person',{
            person:result
        });

        db.CountNum(year,item,detail,function(data){
            console.log(data);
            if(data[0].num<=10){//小于10的简单策略
                if(data[0].num==1)//等于1的策略，把1个人放到10个屏幕上
                {
                    for(var i=1;i<11;i++)
                   {
                        if(screenArr[i])
                        {
                           console.log(i);
                            screenArr[i].send(result[0]);
                        }
                        else
                           console.log('第'+i+'屏未启动');
                    }
                }else if(data[0].num==2)//等于2的策略，前五个屏幕显示一个人后五个屏幕显示一个人
                {
                    for(var i=1;i<11;i++)
                   {
                    if(i<=5){
                        if(screenArr[i])
                        {
                           console.log(i);
                            screenArr[i].send(result[0]);
                        }
                        else
                           console.log('第'+i+'屏未启动');
                        }
                        else{
                             if(screenArr[i])
                        {
                           console.log(i);
                            screenArr[i].send(result[1]);
                        }
                        else
                           console.log('第'+i+'屏未启动');
                        }

                        }
                    }else if(data[0].num==3){//等于3的策略
                        for(var i=1;i<11;i++)
                        {
                            if(i<=3)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[0]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }
                            else if(i<=6)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[1]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }
                            else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[2]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==4)//4的策略 2233
                    {
                        for(var i=1;i<11;i++)
                        {
                            if(i<=2)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[0]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }else if(i<=4){
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[1]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }else if(i<=7){
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[2]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[3]);
                                }
                                else
                                console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==5)//5的策略 22222
                    {
                        for(var i=1;i<11;i++)
                        {
                            if(screenArr[i])
                            {
                                console.log(i);
                                screenArr[i].send(result[(i/2)]);
                            }else
                            console.log('第'+i+'屏未启动');
                        }
                    }else if(data[0].num==6){//6的策略 112222
                        for(var i=1;i<11;i++)
                        {
                            if(i<=2)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[(i-1)]);
                                }
                                else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=4)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[2]);
                                }
                                else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=6)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[3]);
                                }
                                else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=8)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[4]);
                                }
                                else
                                    console.log('第'+i+'屏未启动');
                            }else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[5]);
                                }
                                else
                                    console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==7){//7的策略 1111222
                        for(var i=1;i<11;i++)
                        {
                            if(i<=4)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[(i-1)]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=6)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[4]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=8)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[5]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[6]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==8){//8的策略 11111122
                        for(var i=1;i<11;i++)
                        {
                            if(i<=6){
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[(i-1)]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else if(i<=8)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[6]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[7]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==9)//9的策略 111111112
                    {
                        for(var i=1;i<11;i++)
                        {
                            if(i<=8)
                            {
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[(i-1)]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }else{
                                if(screenArr[i])
                                {
                                    console.log(i);
                                    screenArr[i].send(result[8]);
                                }else
                                    console.log('第'+i+'屏未启动');
                            }
                        }
                    }else if(data[0].num==10)//10的策略 1111111111
                    {
                        for(var i=1;i<11;i++)
                        {
                            if(screenArr[i])
                            {
                                console.log(i);
                                screenArr[i].send(result[(i-1)]);
                            }else
                                console.log('第'+i+'屏未启动');
                        }
                    }
                }
                else{//大于10的策略
//                    time = data[0].num/10;
//                    residual = data[0].num%10;
                    for(var i=0,j=1;i<data[0].num;i++,j++)
                    {
                        if(screenArr[j])
                        {
                            screenArr[j].send(result[i]);
                        }
                        else
                            console.log('第'+i+'屏未启动');
                        if(j==10){
                            var beginTime = new Date().getTime();
                            while(new Date().getTime()<beginTime+5000){
                                //停止5秒
                            };
                            j=0;
                        }
                    }
                }
            });

    });
});
//目前能够找到对应的某个立功人员 策略还没有写完
//测试是否连接上数据库
//db.select('example');

server.listen(3001, function(){
  console.log("Express server listening on port 3001" );
});