const readline = require('readline');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
var encoding = require('encoding');

const regexp = /\d+###(?<number>\S+\/\d+)###/;

const file1 = path.resolve('tmp', 'файл1.csv');
const file2 = path.resolve('tmp', 'файл2.csv');

/*
// Поток декодирования (из потока двоичных данных в строки js)
http.createServer(function (req, res) {
	var converterStream = iconv.decodeStream('win1251');
	req.pipe(converterStream);

	converterStream.on('data', function (str) {
		console.log(str); // Делаем что-нибудь с декодированными строками, фрагмент за фрагментом.
	});
});
*/

/*
// Пример преобразования кодировки потоковой передачи
fs.createReadStream('./tmp/файл1.csv')
	.pipe(iconv.decodeStream('win1251'))
	.pipe(iconv.encodeStream('utf-8'))
	.pipe(fs.createWriteStream('./tmp/res.csv'));
*/

/*
// Сахар: все потоки кодирования/декодирования имеют метод .collect(cb) для накопления данных.
http.createServer(function (req, res) {
	req.pipe(iconv.decodeStream('win1251')).collect(function (err, body) {
		assert(typeof body == 'string');
		console.log(body); // полная строка тела запроса
	});
});
*/

//Читаем файл в utf-8 кодировке(BAS всегда сохраняет в utf-8)
var text = iconv.decode(fs.readFileSync('./tmp/файл1.csv'), 'win1251');
if (text.match(regexp)) {
	// let match = text.match(regexp);
	//console.log(match.groups.number);
	fs.writeFileSync('./tmp/res.csv', text);
} else {
}

//Конвертим

//Пишем в файл
