var $fs = require('fs');

var $data = $fs.readFileSync('./req-res-timout-src-a.txt');
var route_max_timeout = 15000;

require('http').createServer(function(req, res) {
    var total_route_timeout = setTimeout(function() {
        // reset response? - no - how I modify it in controller I will receive it in main error handler.
        controller_error_handler_408(req, res);
    }, route_max_timeout);

    res.setTimeout(route_max_timeout, function() {}); // empty function so socket is not destroyed by Node.js
    var res_end_called = false;

    (function(nativeEnd, nativeWrite) {
        res.end = function(/* args */) { // should work also with readable.pipe(res) - https://github.com/nodejs/node/blob/master/lib/_stream_readable.js#L625
            if (res_end_called) { // prevent Error [ERR_STREAM_WRITE_AFTER_END]: write after end
                return;
            }
            res_end_called = true;
            console.log('res_end_called');

            console.log('clear_timeout: ', total_route_timeout);
            clearTimeout(total_route_timeout);

            nativeEnd.apply(res, arguments);
        };
        res.write = function(/* args */) {
            if (res_end_called) { // prevent Error [ERR_STREAM_WRITE_AFTER_END]: write after end
                return;
            }
            nativeWrite.apply(res, arguments);
        };
    }(res.end, res.write));

    controller_action(req, res);
}).listen(8000, 'localhost');

function controller_action(req, res) {
    setTimeout(function() {
        console.log('controller_logic_continues_but_res_method_calls_are_ingored');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        var src = $fs.createReadStream('./req-res-timout-src-b.txt');
        src.pipe(res);

        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end($data);
    }, 7000);
}

function controller_error_handler_408(req, res) {
    res.writeHead(408, { 'Content-Type': 'text/plain' });
    res.end('route timeout');
    res.end('unexpected end');
}
