import clc from 'cli-color';

export class Logger {
    /**
     * Get current formatted time
     * @param mills Include milliseconds?
     * @returns HH:MM:SS:?MS
     */
    private static getTime(mills = false) {
        let date = new Date();

        //HH:MM:SS:MS
        let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

        let time = `${hours}:${minutes}:${seconds}`;

        if (mills) {
            let milliseconds =
                date.getMilliseconds() < 10
                    ? `00${date.getMilliseconds()}`
                    : date.getMilliseconds() < 100
                      ? `0${date.getMilliseconds()}`
                      : date.getMilliseconds();
            time += `:${milliseconds}`;
        }

        return time;
    }

    private static write(type: 'error' | 'text', text: string, time: boolean = true) {
        const fnc = type == 'error' ? clc.red : clc.cyan;
        const _text = type == 'error' ? 'ERROR' : 'INFO';

        let string = '';

        if (time) {
            string += `${clc.blackBright('[')}${clc.yellow(Logger.getTime(false))}${clc.blackBright(']')} `;
        }

        string += `${clc.blackBright('[')}${fnc(_text)}${clc.blackBright(']')} ${clc.white(text)}`;

        console.log(string);
    }

    public static log(text: string, time = true) {
        Logger.write('text', text, time);
    }

    public static error(text: string, time = true) {
        Logger.write('error', text, time);
    }
}
