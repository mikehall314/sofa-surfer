export type SerializableValue =
	| string
	| number
	| boolean
	| null
	| { [key: string]: SerializableValue }
	| SerializableValue[];

export type CouchDBDocument = SerializableValue & {
	_id: string;
	_rev: string;
};

export type MaybeCouchDBDocument = SerializableValue & {
	_id?: string;
	_rev?: string;
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
