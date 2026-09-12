import type { ViewQuery } from './view-query.ts';
import type {
	Document,
	DocumentCreated,
	CreateDocumentIntent,
	ViewQueryResponse,
	Emitted,
} from './types.ts';
import {
	CouchDBDocumentUpdateConflict,
	CouchDBNotFoundError,
} from './errors.ts';

export class SofaSurfer {
	#baseUrl: URL;
	#authorization?: string;
	#fetch: typeof fetch;

	constructor(conn: string, fetchFn = fetch) {
		const url = new URL(conn);
		if (url.username) {
			const bytes = new TextEncoder().encode(`${url.username}:${url.password}`);
			this.#authorization = bytes.toBase64();
		}

		url.username = '';
		url.password = '';

		if (url.pathname.endsWith('/') === false) {
			url.pathname += '/';
		}

		this.#fetch = fetchFn;
		this.#baseUrl = url;
	}

	#getHeaders(): Headers {
		const headers = new Headers({ 'content-type': 'application/json' });

		if (this.#authorization) {
			headers.set('authorization', `Basic ${this.#authorization}`);
		}

		return headers;
	}

	async get<T extends Document = Document>(id: string): Promise<T> {
		const url = new URL(encodeURIComponent(id), this.#baseUrl);
		const response = await this.#fetch(url, {
			headers: this.#getHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		return response.json();
	}

	async insert(doc: CreateDocumentIntent): Promise<DocumentCreated> {
		// This is for inserting only. If the user wants to update,
		// they should use `replace` with `_id` and `_rev`.
		if (Object.hasOwn(doc, '_rev')) {
			throw new CouchDBDocumentUpdateConflict('Document must not include _rev');
		}

		const response = await this.#fetch(this.#baseUrl, {
			method: 'POST',
			headers: this.#getHeaders(),
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

	async replace(
		id: string,
		rev: string,
		doc: CreateDocumentIntent,
	): Promise<DocumentCreated> {
		const url = new URL(encodeURIComponent(id), this.#baseUrl);
		url.search = new URLSearchParams({ rev }).toString();

		const response = await this.#fetch(url, {
			method: 'PUT',
			headers: this.#getHeaders(),
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

	async remove(id: string, rev: string): Promise<DocumentCreated> {
		const url = new URL(encodeURIComponent(id), this.#baseUrl);
		url.search = new URLSearchParams({ rev }).toString();

		const response = await this.#fetch(url, {
			method: 'DELETE',
			headers: this.#getHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		if (response.status === 409) {
			throw new CouchDBDocumentUpdateConflict();
		}

		return response.json();
	}

	async query<S = Emitted>(q: ViewQuery): Promise<ViewQueryResponse<S>> {
		const url = new URL(q.toString(), this.#baseUrl);

		const response = await this.#fetch(url, {
			method: q.hasPostData() ? 'POST' : 'GET',
			body: q.hasPostData() ? JSON.stringify(q.postData()) : undefined,
			headers: this.#getHeaders(),
		});

		if (response.status === 404) {
			throw new CouchDBNotFoundError();
		}

		return response.json();
	}
}
