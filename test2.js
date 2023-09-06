const readline = require('readline');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const _ = require('lodash');

const regexp = /\d+###(?<number>\S+\/\d+)###/;

// делаем UTF-8 файлы
let text1 = iconv.decode(fs.readFileSync('./tmp/файл1.csv'), 'win1251');
// let text1 = iconv.decode(fs.readFileSync('./tmp/exp_20230701_20230801 НЦЭУ.csv'), 'win1251');
fs.writeFileSync('./tmp/res1.csv', text1);
let text2 = iconv.decode(fs.readFileSync('./tmp/файл2.csv'), 'win1251');
// let text2 = iconv.decode(fs.readFileSync('./tmp/exp_20230701_20230731 ИИЦ.csv'), 'win1251');
fs.writeFileSync('./tmp/res2.csv', text2);

const file1 = path.resolve('tmp', 'res1.csv');
const file2 = path.resolve('tmp', 'res2.csv');

const writeStream = fs.createWriteStream(path.join('./tmp', 'Разница.csv'));

const s1 = new Set();
const s2 = new Set();

const p = [read(file2, s2, s1), read(file1, s1, s2)];
// const p = read(file2, s2, s1);

/*
Promise.all(p)
	.then((a) => {
		info(file1, s2);
		info(file2, s1);
		console.log('Все');
	})
	.catch(console.log);

// информация по файлу
function info(file, data) {
	if (!data.size) {
		console.log('В %s есть все.', file);
		return;
	}
	console.log('В %s отсутствует:', file);
	//data.forEach((s) => console.log(s));
}
*/

// чтение и обработка
function read(file, mine, stranger) {
	let cnt = 0;
	const ri = readline.createInterface({
		input: fs.createReadStream(file),
		console: false,
	});
	ri.on('close', (_) => {
		console.log('%s - строк %sшт', file, cnt);
	});
	ri.on('error', (err) => {
		console.log({ file, err });
	});
	ri.on('line', (str) => {
		console.log('----------------------------------');
		++cnt;
		console.log(cnt);
		if (str.match(regexp)) {
			let match = str.match(regexp);
			let id = String(match.groups.number).trim();
			//let arr = Array.from(stranger);
			let include = false;

			//console.log('arr', arr);
			stranger.forEach((item) => {
				if (item.includes(id)) {
					include = true;
				}
				console.log(item);

				console.log('_.each', id);
				console.log('_.each', include);

				if (include) {
					console.log('stranger.delete(str)');
					stranger.delete(str);
				} else if (!include && str.includes('###IIC')) {
					console.log('str.includes(###IIC):', str.includes('###IIC'));
					console.log('str.includes(###IIC):', id);
					writeStream.write(str + `\n`);
					mine.add(str);
				}
			});
		}
	});
}
