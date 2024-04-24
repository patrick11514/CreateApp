import { Main } from './main';

export type BaseProject = {
    name: string;
    key: string;
    function: (main: Main, path: string, name: string) => Promise<void>;
};
