import type { ViewQuery } from './view-query';
import type {
	CouchDBDocument,
	CouchDBDocumentCreated,
	CouchDBViewQueryResponse,
	MaybeCouchDBDocument,
	SerializableValue,
} from './types';
import { CouchDBDocumentUpdateConflict, CouchDBNotFoundError } from './errors';

export class SofaSurfer {
	private readonly authorization: string;

	constructor(private readonly baseUrl: URL) {
		this.authorization = Buffer.from(
			`${baseUrl.username}:${baseUrl.password}`,
		).toString('base64');

		baseUrl.username = '';
		baseUrl.password = '';
	}

	use(db: string) {
		this.baseUrl.pathname = db;
	}

	private getCommonHeaders() {
		return {
			authorization: `Basic ${this.authorization}`,
			'content-type': 'application/json',
		};
	}

	async get<T extends CouchDBDocument = CouchDBDocument>(
		id: string,
	): Promise<T> {
		const uri = `${this.baseUrl}/${encodeURIComponent(id)}`;
		const response = await fetch(uri, {
			headers: this.getCommonHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		return response.json();
	}

	async insert<T extends MaybeCouchDBDocument = MaybeCouchDBDocument>(
		doc: T,
	): Promise<CouchDBDocumentCreated> {
		delete doc._rev;

		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: this.getCommonHeaders(),
			body: JSON.stringify(doc),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		if (response.status === 409) {
			throw new CouchDBDocumentUpdateConflict();
		}

		return response.json();
	}

	async replace<T extends SerializableValue = SerializableValue>(
		id: string,
		rev: string,
		doc: T,
	): Promise<CouchDBDocumentCreated> {
		const uri =
			`${this.baseUrl}/${encodeURIComponent(id)}?` +
			new URLSearchParams({ rev });

		const response = await fetch(uri, {
			method: 'PUT',
			headers: this.getCommonHeaders(),
			body: JSON.stringify(doc),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		if (response.status === 409) {
			throw new CouchDBDocumentUpdateConflict();
		}

		return response.json();
	}

	async remove(id: string, rev: string): Promise<CouchDBDocumentCreated> {
		const uri =
			`${this.baseUrl}/${encodeURIComponent(id)}?` +
			new URLSearchParams({ rev });

		const response = await fetch(uri, {
			method: 'DELETE',
			headers: this.getCommonHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		if (response.status === 409) {
			throw new CouchDBDocumentUpdateConflict();
		}

		return response.json();
	}

	async query<
		V extends SerializableValue,
		K extends SerializableValue,
		D extends CouchDBDocument = CouchDBDocument,
	>(query: ViewQuery): Promise<CouchDBViewQueryResponse<V, K, D>> {
		const uri = `${this.baseUrl}/${query}`;

		const response = await fetch(uri, {
			method: query.hasPostData() ? 'POST' : 'GET',
			body: query.hasPostData() ? JSON.stringify(query.postData()) : undefined,
			headers: this.getCommonHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		if (response.status === 409) {
			throw new CouchDBDocumentUpdateConflict();
		}

		return response.json();
	}
}
