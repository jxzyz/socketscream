 $(function () {
//改过js 原本没有info数组 加上info数组的想法是要输出所有从manage传过来的指令（包括历史）
    var info = new Array();
    // 字符串
    console.log(location.search);
    var n = location.search.slice(1).split('=')[1];

    var content = $('#content');
    //建立websocket连接
    socket = io.connect('http://localhost:3001');

    //收到server的连接确认
    socket.on('open',function(){

        //监听system事件，判断welcome或者disconnect，打印系统消息信息
        socket.on('system',function(res){
            console.log(res);
            info.push(res);
            for(var i=0;i<info.length;i++)
            content.html('当前n：' + info[i].screenNum + '；<br/>id为' + info[i].id + ',<br/> 姓名为: ' + info[i].name +'<br/>性别：'+info[i].gender+'<br/>部门：'+info[i].department);
        });

        socket.send(n);
    });

});