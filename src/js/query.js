// 使用标准的DB API
var indexedDB = window.indexedDB;

var IDBTransaction = window.IDBTransaction;
var IDBKeyRange = window.IDBKeyRange;

var version = 1;
// 以日志的形式记录发生的数据库错误
function logerr(e) {
    console.log('IndexedDB error' + e.code + ': ' + e.messgae);
}

/**
 * 异步获取数据库对象（需要的时候，用于创建和初始化数据库）
 * @param {*} f 
 */
function withDB(f) {
    var request = indexedDB.open('zipcodes', version++);
    request.onerror = logerr;
    request.onsuccess = function() {
        // request 对象的result值就表示该数据库
        var db = request.result;
        // 通过检查版本号来确定是否已经创建或者初始化
        // 如果db已经初始化了，就直接将它传递给f函数
        // 否则，先初始化db
        if (db.version > 1) f(db)
        else initdb(db, f)
    }
    request.onupgradeneeded = function(e) {
        var db = e.target.result
        f(db)
    }
}

/**
 * 建立数据库结构，并用相应的数据填充它
 * 然后将该数据库传递给f函数
 * 如果数据库还未初始化，withDB函数会调用此函数
 * @param {*} db 
 * @param {*} f 
 */
function initdb(db, f) {
    // 第一次运行次应用的时候需要给出必要的提示
    var statusline = document.createElement('div');
    statusline.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        color: white;
        background-color: black;
        font: bold 18pt sans-serif;
        padding: 10px;
    `
    document.body.appendChild(statusline);

    function status(msg) {
        statusline.innerHTML = msg.toString();
    }

    status('初始化 zipcode 数据库');

    // 只有在setVersion请求的onsuccess处理程序中才能定义或者修改indexedDB数据库的结构
    // 试着更新数据库的版本号
    var request = db;
    // var request = db.setVersion('1');
    request.onerror = status;
    // request.onsuccess = function() {
        // 创建一个对象存储区域，并为该存储区域指定一个名字
        // 同时也为包含指定该区域中键字段属性名的键路径的一个可选对象指定名字
        // （如果省略键路径，Indexed DB会定义它自己的唯一的整型键）
        var store = db.createObjectStore('zipcodes', { keyPath: 'zipcode' });
        
        // 通过城市名以及邮政编码来索引对象存储区
        // 使用此方法，表示键路径的字符串要直接传递过去
        // 并且是作为必需的参数而不是可选对象的一部分
        store.createIndex('cities', 'city');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '../files/zipcodes.csv');   // 利用HTTP GET 方法获取此URL指定内容
        xhr.send();                                 // 直接获取
        xhr.onerror = status;                       // 显示错误状态
        
        // 已处理的数量
        var lastChar = 0, numlines = 0;

        // 获取数据后，批量处理数据库文件
        // 一个函数同时作为两个事件处理程序
        xhr.onprogress = xhr.onload = function(e) {
            // 在接收数据的lastChar和lastNewLine之间处理数据块
            // （需要查询newlines，因此不需要处理部分记录项）
            var lastNewLine = xhr.responseText.lastIndexOf('\n');
            if (lastNewLine > lastChar) {
                var chunk = xhr.responseText.substring(lastChar, lastNewLine);
                // 记录下次从哪里开始
                lastChar = lastNewLine + 1;

                // 将新的数据块分割成单独的行
                var lines = chunk.split('\n');
                numlines += lines.length;
                
                // 为了将邮政编码数据库储存到数据库中
                // 这里需要事务对象
                // 浏览器返回事件循环时，向数据库提交所有使用该对象进行的所有数据库插入操作
                // 要创建事务对象，需要指定要使用的对象存储区
                // 并且告诉该对象存储区
                // 需要对数据库进行写操作而不只是读操作
                var transaction = db.transaction(['zipcodes'], IDBTransaction.READ_WRITE)

                // 从事务中过去对象存储区
                var store = transaction.objectStore('zipcodes');

                // 现在，循环邮政编码文件中的每一行数据
                // 为他们创建相应的对象，并将对象添加到对象的存储区中
                for (let i = 0; i < lines.length; i++) {
                    var [zipcode, city, state, latitude, longitude] = lines[i].split(',');
                    var record = {
                        zipcode,
                        city,
                        state,
                        latitude,
                        longitude
                    }
                    // IndexedDB API 最好的部分就是对象存储区真的非常简单
                    // 下面就是在数据库中添加一条记录的方式
                    store.put(record);
                }

                status('初始化 zipcodes 数据库： 加载' + numlines + '条记录。')
            }
            if (e.type == 'load') {
                // 如果这是最后的载入事件
                // 就将所有的邮政编码数据发送给数据库
                // 但是，由于刚刚处理了4万条数据，可能他还在处理中
                // 因此这里做个简单的查询
                // 当此查询成功时，就能够得知数据库已经就绪了
                // 然后就可以将状态条移除了
                // 最后调用此前传给withDB函数的f函数
                lookupCity('02134', function(s) {
                    document.body.removeChild(statusline);
                    withDB(f);
                })
            }
        }
    // }
}

/**
 * 给定一个邮政编码，查询该邮政编码属于哪个城市
 * 并将该城市名异步传递给指定的回调函数
 * @param {*} zip 
 * @param {*} callback 
 */
function lookupCity(zip, callback) {
    withDB(function(db) {
        // 为本次查询创建一个事务对象
        var transaction = db.transaction(
            ['zipcodes'],               // 所需的对象存储区
            // IDBTransaction.READ_ONLY,   // 没有更新
            'readonly',
            0                           // 没有超时
        );

        // 从事务中获取对象存储区
        var objects = transaction.objectStore('zipcodes');

        // 查询和指定的邮政编码的键匹配的对象
        // 上述代码时同步的，到那时这里的是异步的
        var request = objects.get(zip);
        request.onerror = logerr;
        request.onsuccess = function() {
            // result对象可以通过request.result属性获取
            var object = request.result;
            if (object) {
                callback(object.city + ', ' + object.state);
            } else {
                callback('未知的邮政编码');
            }
        }
    })
}

/**
 * 给定城市名（区分大小写），来查询对应的邮政编码
 * 然后挨个将结果异步传递给指定的回调函数
 * @param {*} city 
 * @param {*} callback 
 */
function lookupZipcodes(city, callback) {
    withDB(function(db) {
        // 创建一个事务并获取对象存储区
        var transaction = db.transaction(['zipcodes'], IDBTransaction.READ_ONLY, 0);

        var store = transaction.objectStore('zipcodes');

        // 从对象存储区中获取城市索引
        var index = store.index('cities');

        // 此次查询可能会返回很多结果，因此必须使用游标对象来获取他们
        // 要创建一个游标，需要一个表示键值范围的range对象
        var range = new IDBKeyRange.only(city); // 传递一个单键给only方法获取一个range对象

        // 上述所有的操作都是同步的
        // 现在，请求一个游标，他会以异步的方式返回
        var request = index.openCursor(range); // 获取游标

        request.onerror = logerr;
        request.onsuccess = function() {

            // 此事件处理程序会调用多次
            // 每次有匹配查询的记录会调用一次
            // 然后当标识操作结束的null游标出现的时候，也会调用一次
            var cursor = request.result;// 通过request.result获取游标
            if (!cursor) return         // 如果没有游标就说明没有结果了
            var object = cursor.value;  // 获取培训的数据项
            callback(object);           // 将其传递给回调函数
            cursor.continue();          // 继续请求下一个匹配的数据项
        }
    })
}

/**
 * 下面展示的，document中的onchange回调函数会用到此方法
 * 它查询数据库并展示查询到的结果
 * @param {*} zip 
 */
function displayCity(zip) {
    lookupCity(zip, function(s) {
        document.getElementById('city').value = s;
    })
}

/**
 * 这是下面的文档中使用的另一个onchange回调函数
 * 它查询数据库并展示查询到结果
 * @param {*} city 
 */
function displayZipcodes(city) {
    var output = document.getElementById('zipcodes');
    output.innerHTML = '查询数据库：';
    lookupZipcodes(city, function(o) {
        var div = document.createElement('div');
        var text = o.zipcode + ': ' + o.city + ', ' + o.state;
        div.appendChild(document.createTextNode(text));
        output.appendChild(div)
    })
}
