const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');
const _ = require('lodash');

// Регулярка поиска номера услуги в строке (2 поле)
const regexp = /\d+###(?<number>\S+)###\d\d\.\d\d.\d+###\d\d\./;

// Результирующий файл
const resultFile = '_Разница.csv';

// Промежуточные файлы, перекодированнные в UTF-8
const tmpNCEU = 'NCEU.csv';
const tmpIIC = 'IIC.csv';

let nceuFile = process.argv[2];
let iicFile = process.argv[3];

// делаем промежуточные UTF-8 файлы csv
let text1 = iconv.decode(fs.readFileSync(nceuFile), 'win1251');
fs.writeFileSync(tmpNCEU, text1);

let text2 = iconv.decode(fs.readFileSync(iicFile), 'win1251');
fs.writeFileSync(tmpIIC, text2);

const file1 = path.resolve(tmpNCEU);
const file2 = path.resolve(tmpIIC);

const writeStream = fs.createWriteStream(path.join(resultFile));
// Если хотим ID записать в файл:
// const writeStreamID = fs.createWriteStream(path.join('./tmp', 'ID.csv'));

//-----------------------------------------------------------
// сразу загружаем ID, поэтому промис
const loadingIDProm = new Promise(function (resolve, reject) {
	let arr = [];
	let count = 0;
	const rid = readline.createInterface({
		input: fs.createReadStream(file1),
		console: false,
		prompt: '>',
	});
	rid.on('close', (_) => {
		console.log('ID НЦЭУ:', count, 'строк');
		resolve(arr);
	});
	rid.on('line', (str) => {
		count++;
		if (str.match(regexp)) {
			let match1 = str.match(regexp);
			let id1 = String(match1.groups.number).trim();
			arr.push(id1);
			// Если хотим ID в файле:
			// writeStreamID.write(id1 + `\n`);
		}
	});
});

//--------------------------------------------------------
// после полной загрузки ID выполняем сверку
loadingIDProm.then((arr) => {
	const s1 = new Set();
	const s2 = new Set();

	// Если нужно искать уникальные строки среди обоих файлов
	// const p = [read(file1, s1, s2), read(file2, s2, s1)];
	// проверяем второй файл по первому
	const p = [read(file2, s2, s1)];

	Promise.all(p)
		.then(() => {
			// info(file1, s2);
			// info(file2, s1);
			console.log('Файл', resultFile, 'сформирован');

			fs.unlink(tmpNCEU, (err) => {
				if (err) throw err; // не удалось удалить файл
				// console.log(`Файл ${tmpNCEU} удалён`);
			});
			fs.unlink(tmpIIC, (err) => {
				if (err) throw err; // не удалось удалить файл
				// console.log(`Файл ${tmpIIC} удалён`);
			});

			console.log('++++++++++ Готово ++++++++++');
		})
		.catch(console.log);

	// // информация по файлу в консоли
	// function info(file, data) {
	// 	if (!data.size) {
	// 		console.log('В %s есть все.', file);
	// 		return;
	// 	}
	// 	console.log('В %s отсутствует:', file);
	// 	data.forEach((s) => console.log(s));
	// }

	// чтение и обработка
	function read(file, mine, stranger) {
		return new Promise((resolve, reject) => {
			let cnt = 0;
			const rLine = readline.createInterface({
				input: fs.createReadStream(file),
				console: false,
			});
			rLine.on('close', (_) => {
				console.log('%s - строк %sшт', file, cnt);
				resolve({ file, cnt });
			});
			rLine.on('error', (err) => {
				reject({ file, err });
			});
			// построчная обработка
			rLine.on('line', (str) => {
				if (cnt === 0) console.log('Сравнение файлов...');
				++cnt;

				if (str.match(regexp)) {
					let match = str.match(regexp);
					let id = match.groups.number;

					if (_.includes(arr, id)) {
						stranger.delete(str);
					} else if (str.includes('###IIC')) {
						writeStream.write(str + `\n`);
						mine.add(str);
					}
				}
			});
		});
	}
});
