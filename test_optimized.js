const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');

// Регулярное выражение для извлечения номера услуги
const REGEXP = /\d+###(?<number>\S+)###\d\d\.\d\d.\d+###\d\d\./;

const resultFile = '_Разница.csv';
const nceuFile = process.argv[2];
const iicFile = process.argv[3];

if (!nceuFile || !iicFile) {
    console.error('Использование: node script.js <NCEU_file> <IIC_file>');
    process.exit(1);
}

// Чтение ID из NCEU-файла (в кодировке win1251)
function loadNceuIds(filePath) {
    return new Promise((resolve, reject) => {
        const ids = new Set();
        let count = 0;

        const decoder = iconv.getDecoder('win1251');
        const stream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: stream.pipe(iconv.decodeStream('win1251')), // прямая перекодировка в потоке
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            count++;
            const match = line.match(REGEXP);
            if (match) {
                ids.add(match.groups.number.trim());
            }
        });

        rl.on('close', () => {
            console.log('ID НЦЭУ:', count, 'строк, уникальных ID:', ids.size);
            resolve(ids);
        });

        rl.on('error', reject);
    });
}

// Чтение IIC и сравнение с ID из NCEU
function processIicAndWriteDiff(ids, iicPath, outFile) {
    return new Promise((resolve, reject) => {
        let lineCount = 0;

        const writeStream = fs.createWriteStream(outFile);
        const rl = readline.createInterface({
            input: fs.createReadStream(iicPath).pipe(iconv.decodeStream('win1251')),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            lineCount++;
            const match = line.match(REGEXP);
            if (!match) return;

            const id = match.groups.number;
            // Пишем только если ID отсутствует в НЦЭУ И строка содержит ###IIC
            if (!ids.has(id) && line.includes('###IIC')) {
                writeStream.write(line + '\n');
            }
        });

        rl.on('close', () => {
            writeStream.end();
            console.log('IIC обработан:', lineCount, 'строк');
            resolve();
        });

        rl.on('error', reject);
    });
}

// Основной запуск
async function main() {
    try {
        const nceuIds = await loadNceuIds(nceuFile);
        await processIicAndWriteDiff(nceuIds, iicFile, resultFile);
        console.log('Файл', resultFile, 'сформирован');
        console.log('++++++++++ Готово ++++++++++');
    } catch (err) {
        console.error('Ошибка:', err);
        process.exit(1);
    }
}

main();