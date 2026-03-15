export type SerializableValue =
	| string
	| number
	| boolean
	| null
	| { [key: string]: SerializableValue }
	| SerializableValue[];

export type CouchDBDocument = {
	_id: string;
	_rev: string;
	[key: string]: SerializableValue;
};

export type CreateDocumentIntent = {
	_id?: string;
	[key: string]: SerializableValue | undefined;
};

export type CouchDBDocumentCreated = {
	id: string;
	rev: string;
	ok: boolean;
};

export type CouchDBViewQueryResponse<
	V extends SerializableValue,
	K extends SerializableValue,
	D extends CouchDBDocument,
> = {
	total_rows: number;
	offset: number;
	rows: Array<{ id: string; key: K; value: V; doc?: D }>;
};
