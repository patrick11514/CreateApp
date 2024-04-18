"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./lib/main");
(async () => {
    try {
        const main = new main_1.Main();
        await main.Start();
    }
    catch (_) {
        console.log(_);
    }
})();
