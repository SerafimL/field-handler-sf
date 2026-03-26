
import { createInterface } from 'node:readline'
import process from 'node:process';

const inputMap = new Map();

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (key) {
    // Check for Ctrl+C (end of text transmission, represented as '\u0003')
    if (key === '\u0003') {
      console.log('Ctrl+C detected. Exiting...');
      process.exit(); // Exit the process
    }

});

const rli = createInterface({
    input: process.stdin,
    output: process.stdout,
});

export const input = (prompt) => {
    return new Promise((resolve, reject) => {
        rli.question(prompt, (uinput) => {
            inputMap.set(prompt, uinput);
            resolve(uinput);
        }, ()=> {
            if(reject) {
                reject();
            } else {
                console.log('Erro');
            }
        });
    });
}

export const close = () => rli.close();