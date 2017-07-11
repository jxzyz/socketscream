var mysql = require('mysql');
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'medal'
});
        connection.connect();
exports.insert = function(table,param){
        var sql = "insert into "+table+"(name,type,content)values(?,?,?);";
        var addparam = param;
        console.log(addparam);
        connection.query(sql,addparam,function(err,result){
            if(err){
                console.log('[Insert error] - ',err.message);
                return;
            }
            console.log("----------------insert----------");
            console.log("insert id:",result);
            console.log("--------------------------------\n\n");
        });

};
//查全部
exports.select = function(table){

        var sql ="select * from "+table+";";
        connection.query(sql,function(err,result){
            if(err){
                console.log('[Insert error] - ',err.message);
                return;
            }
            console.log("----------------select----------");
            console.log(result);
            console.log("--------------------------------\n\n");
        });

};
//认为每一个名字都唯一
exports.GetName = function(name,callback){

        var sql = "select * from example where name = '"+name+"';";
        connection.query(sql,function(err,result){
            if(!err){
                var res = hasName(result);
                callback(res);
            }
            else{
                callback(error());
            }
        });

        function hasName(result){
            if(result.length == 0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result[0];
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }
};
exports.FindAll = function(callback){
        var sql = "select * from example;";
        connection.query(sql,function(err,result){
            if(!err){
                var res = hasName(result);
                callback(res);
            }
            else{
                callback(error());
            }
        });

        function hasName(result){
            if(result.length==0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result;
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }
};
exports.FindYear = function(callback){
    var sql = "select distinct year from prize;";
    connection.query(sql,function(err,result){
        if(!err){
            var res = hasName(result);
            callback(res);
        }
        else{
            callback(error());
        }
    });
            function hasName(result){
            if(result.length==0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result;
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }
};
exports.FindItem = function(year,callback){
    var sql = "select distinct item from prize where year='"+year+"';";
    connection.query(sql,function(err,result){
        if(!err){
            var res = hasName(result);
            callback(res);
        }
        else{
            callback(error());
        }
    });
        function hasName(result){
            if(result.length==0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result;
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }
};
exports.FindPrize = function(year,item,callback){
    var sql = "select distinct detail from prize where year='"+year+"'and item = '"+item+"';";
    connection.query(sql,function(err,result){
        if(!err){
            var res = hasName(result);
            callback(res);
        }
        else{
            callback(error());
        }
    });
        function hasName(result){
            if(result.length==0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result;
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }
};
exports.FindPerson = function(year,item,detail,callback){

    var sql = "select person.id,person.name,person.gender,person.department,person.pic from person join per_pri on person.id = per_pri.id where per_pri.year='"+year+"' and per_pri.item='"+item+"'and per_pri.detail='"+detail+"';";
        connection.query(sql,function(err,result){
        if(!err){
            var res = hasName(result);
            callback(res);
        }
        else{
            callback(error());
        }
    });
        function hasName(result){
            if(result.length==0){
                return{
                    err:1,
                    msg:"内容不存在"
                };
            }
            else{
                return result;
            }
        }
        function error(){
            return{
                err:1,
                msg:"出错"
            };
        }

};