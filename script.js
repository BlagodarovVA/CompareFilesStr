const readline = require('readline');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

// const regexp = /\d+###(?<number>\S+\/\d+)###/;
const regexp = /\d+###(?<number>\S+)###\d\d\.\d\d.\d+###\d\d\./;

const file3 = path.resolve('tmp', 'res1.csv');
const file1 = path.resolve('tmp', 'Разница_1.csv');
// const file2 = path.resolve('tmp', 'ID.csv');

//-----------------------------------------------------------
const writeStreamID = fs.createWriteStream(path.join('./tmp', 'ID.csv'));
const writeStream = fs.createWriteStream(
	path.join('./tmp', 'Разница_последняя.csv')
);

const loadingIDProm = new Promise(function (resolve, reject) {
	// имитация асинхронного кода
	let arr = [];
	let count = 0;
	const rid = readline.createInterface({
		input: fs.createReadStream(file3),
		console: false,
	});
	rid.on('close', (_) => {
		console.log('ID массив заполнен', count);
		resolve(arr);
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
});

loadingIDProm.then((arr) => {
	// если нужны еще действия после предыдущих, возвращаем новый промис
	const s1 = new Set();
	const s2 = new Set();

	const p = read(file1, s2, s1);

	// чтение и обработка
	function read(file, mine, stranger) {
		return new Promise((resolve, reject) => {
			let cnt = 0;
			const ri = readline.createInterface({
				input: fs.createReadStream(file),
				console: false,
			});

			ri.on('line', (str) => {
				++cnt;

				if (str.match(regexp)) {
					let match = str.match(regexp);
					let id = match.groups.number;
					let include = false;

					if (_.includes(arr, id)) {
						include = true;
						console.log('arr.includes(id)', id);
						console.log('arr.includes(id)', include);

						stranger.delete(str);
					} else if (str.includes('###IIC')) {
						console.log('include', include);
						console.log('str.includes(###IIC):', id);
						// console.log('str.includes(###IIC):', str.includes('###IIC'));
						writeStream.write(id + `\n`);
						mine.add(str);
					}
				}
			});
		});
	}
});
