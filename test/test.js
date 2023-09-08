// не пишем промежуточные файлы. Скорость такая же, до секунды
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');
const _ = require('lodash');

// Регулярка поиска номера услуги в строке (2 поле)
const regexp = /\d+###(?<number>\S+)###\d\d\.\d\d.\d+###\d\d\./;

// Результирующий файл
const resultFile = '_Разница.csv';

let nceuFile = process.argv[2];
let iicFile = process.argv[3];

// поток на запись результата
const writeStream = fs.createWriteStream(path.join(resultFile));

// делаем промежуточные UTF-8 массивы из файлов. Промис
const loadingNCEU = new Promise(function (resolve, reject) {
	let text1 = iconv.decode(fs.readFileSync(nceuFile), 'win1251');
	let arrText1 = _.split(text1, '\r\n');
	resolve(arrText1);
});

const loadingIIC = new Promise(function (resolve, reject) {
	let text2 = iconv.decode(fs.readFileSync(iicFile), 'win1251');
	let arrText2 = _.split(text2, '\n');
	resolve(arrText2);
});

// загрузка ID
Promise.all([loadingNCEU, loadingIIC])
	.then(([arrText1, arrText2]) => {
		let arrID = [];
		let count = 0;

		_.each(arrText1, function (item) {
			if (item.match(regexp)) {
				count++;
				let match1 = item.match(regexp);
				let id1 = String(match1.groups.number).trim();
				arrID.push(id1);
			}
		});
		console.log('ID НЦЭУ:', count, 'строк');
		return arrID;
	})
	.then(async (arrID) => {
		// после загрузки ID выполняем сверку
		let arrText2 = await loadingIIC;
		let cnt = 0;
		if (cnt == 0) console.log('Сравнение файлов...');
		cnt++;
		_.each(arrText2, function (iicStr) {
			if (iicStr.match(regexp)) {
				let match2 = iicStr.match(regexp);
				let idIIC = String(match2.groups.number).trim();

				if (!_.includes(arrID, idIIC) && iicStr.includes('###IIC')) {
					// console.log(idIIC);
					writeStream.write(iicStr + `\n`);
				}
			}
		});
		console.log('Файл', resultFile, 'сформирован');
		console.log('++++++++++ Готово ++++++++++');
	});
