import type { Generated, Insertable, Selectable, Updateable } from 'kysely';
export interface Database {
    example: exampleTable;
}

export interface exampleTable {
    id: Generated<number>;
    name: string;
}

export type Example = Selectable<exampleTable>;
export type NewExample = Insertable<exampleTable>;
export type ExampleUpdate = Updateable<exampleTable>;
