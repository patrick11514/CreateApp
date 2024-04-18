"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = void 0;
const enquirer_1 = __importDefault(require("enquirer"));
const prompt = async (input) => {
    return enquirer_1.default.prompt(input);
};
exports.prompt = prompt;
