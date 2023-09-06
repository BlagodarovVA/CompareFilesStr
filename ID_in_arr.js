const readline = require('readline');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const _ = require('lodash');

// const regexp = /\d+###(?<number>\S+\/\d+)###/;
const regexp = /\d+###(?<number>\S+)###\d\d\.\d\d.\d+###\d\d\./;

// делаем UTF-8 файлы
// let text1 = iconv.decode(fs.readFileSync('./tmp/файл1.csv'), 'win1251');
let text1 = iconv.decode(
	fs.readFileSync('./tmp/exp_20230701_20230801 НЦЭУ.csv'),
	'win1251'
);
fs.writeFileSync('./tmp/res1.csv', text1);
// let text2 = iconv.decode(fs.readFileSync('./tmp/файл2.csv'), 'win1251');
let text2 = iconv.decode(
	fs.readFileSync('./tmp/exp_20230701_20230731 ИИЦ.csv'),
	'win1251'
);
fs.writeFileSync('./tmp/res2.csv', text2);

const file1 = path.resolve('tmp', 'res1.csv');
const file2 = path.resolve('tmp', 'res2.csv');

//const writeStream = fs.createWriteStream(path.join('./tmp', 'Разница.csv'));
const writeStreamID = fs.createWriteStream(path.join('./tmp', 'ID.csv'));

//-----------------------------------------------------------
let arr = [];
let count = 0;
const rid = readline.createInterface({
	input: fs.createReadStream(file1),
	console: false,
});
rid.on('close', (_) => {
	console.log('ID массив заполнен', count);
	//console.log(arr);
});
rid.on('line', (str) => {
	count++;
	if (str.match(regexp)) {
		let match1 = str.match(regexp);
		let id1 = String(match1.groups.number).trim();
		arr.push(id1);
		writeStreamID.write(id1 + `\n`);
	}
});
//--------------------------------------------------------
