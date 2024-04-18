import { Main } from './lib/main';

(async () => {
    try {
        const main = new Main();
        await main.Start();
        //await main()
        //handle CTRL + C
    } catch (_) {
        console.log(_);
    }
})();
