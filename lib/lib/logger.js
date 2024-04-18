"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
class Logger {
    static getTime(mills = false) {
        let date = new Date();
        let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
        let time = `${hours}:${minutes}:${seconds}`;
        if (mills) {
            let milliseconds = date.getMilliseconds() < 10
                ? `00${date.getMilliseconds()}`
                : date.getMilliseconds() < 100
                    ? `0${date.getMilliseconds()}`
                    : date.getMilliseconds();
            time += `:${milliseconds}`;
        }
        return time;
    }
    static write(type, text, time = true) {
        const fnc = type == 'error' ? cli_color_1.default.red : cli_color_1.default.cyan;
        const _text = type == 'error' ? 'ERROR' : 'INFO';
        let string = '';
        if (time) {
            string += `${cli_color_1.default.blackBright('[')}${cli_color_1.default.yellow(Logger.getTime(false))}${cli_color_1.default.blackBright(']')} `;
        }
        string += `${cli_color_1.default.blackBright('[')}${fnc(_text)}${cli_color_1.default.blackBright(']')} ${cli_color_1.default.white(text)}`;
        console.log(string);
    }
    static log(text, time = true) {
        Logger.write('text', text, time);
    }
    static error(text, time = true) {
        Logger.write('error', text, time);
    }
}
exports.Logger = Logger;
