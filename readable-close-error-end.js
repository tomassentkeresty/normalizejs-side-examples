/* eslint-disable no-underscore-dangle */
var stream = require('stream');
var util = require('util');

function MyReadable() {
    stream.Readable.call(this, {
        objectMode: true
    });
    this._source = ['aa', 'bb', 'cc', 'dd'];
}

util.inherits(MyReadable, stream.Readable);

MyReadable.prototype._read = function() {
    while (this._source.length > 0) {
        this.emit('error', new Error('PartError'));
        if (!this.push(this._source.shift())) {
            break;
        }
    }
    if (!this._source.length) {
        this.push(null);
    }
};

var readable = new MyReadable();
console.log('start');
readable.on('close', function() {
    console.log('closed expectely or unexpectely');
});
readable.on('error', function(err) {
    console.log('stream error: ' + err.message);
});
readable.on('readable', function() {
    var data;
    while (data = this.read()) {
        console.log('data: ', data);
    }
});
readable.on('end', function() {
    console.log('all data consumed');
});
