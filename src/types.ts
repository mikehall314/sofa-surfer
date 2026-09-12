export type SerializableValue =
	| string
	| number
	| boolean
	| null
	| { [key: string]: SerializableValue }
	| SerializableValue[];

export type Document = {
	_id: string;
	_rev: string;
	[key: string]: SerializableValue;
};

export type CreateDocumentIntent = {
	_id?: string;
	_rev?: never;
	[key: string]: SerializableValue | undefined;
};

export type DocumentCreated = {
	id: string;
	rev: string;
	ok: boolean;
};

type EmittedInput = {
	EmitKey?: unknown;
	EmitValue?: unknown;
	Doc?: unknown;
};

export type Emitted<T extends EmittedInput = EmittedInput> = {
	EmitKey: T extends { EmitKey: infer K } ? K : unknown;
	EmitValue: T extends { EmitValue: infer V } ? V : unknown;
	Doc: T extends { Doc: infer D } ? D : undefined;
};

type Row<S = Emitted> = {
	id: string;
	key: S extends { EmitKey: infer K } ? K : unknown;
	value: S extends { EmitValue: infer V } ? V : unknown;
	doc: S extends { Doc: infer D } ? D : undefined;
};

export type ViewQueryResponse<S = Emitted> = {
	total_rows: number;
	offset: number;
	rows: Array<Row<S>>;
};
