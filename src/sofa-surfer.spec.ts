import { vi, describe, it, expect } from 'vitest';
import { SofaSurfer } from './sofa-surfer.ts';
import { ViewQuery } from './view-query.ts';
import {
	CouchDBNotFoundError,
	CouchDBDocumentUpdateConflict,
} from './errors.js';
import { CouchDBViewQueryResponse } from './types.js';

const CONNECTION_STRING = 'http://admin:password@localhost:5984/mydb';

// Returns a minimal fetch stub that resolves with a given status and body
function makeStub(status: number, body: unknown) {
	return vi.fn().mockResolvedValue({
		status,
		json: () => Promise.resolve(body),
	});
}

describe('SofaSurfer', () => {
	describe('constructor', () => {
		it('strips credentials from the base URL', async () => {
			// Given a connection string with credentials
			const fetchStub = makeStub(200, {});
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When a request is made
			await db.get('some-id');

			// Then the URL passed to fetch should not contain credentials
			const url = fetchStub.mock.calls[0][0] as URL;
			expect(url.username).toBe('');
			expect(url.password).toBe('');
		});

		it('sets the Authorization header from credentials', async () => {
			// Given a connection string with credentials
			const fetchStub = makeStub(200, {});
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When a request is made
			await db.get('some-id');

			// Then the Authorization header should be set as Basic auth
			const headers = fetchStub.mock.calls[0][1].headers as Headers;
			expect(headers.get('authorization')).toMatch(/^Basic /);
		});
	});

	describe('get', () => {
		it('returns the document on success', async () => {
			// Given a document exists in the database
			const doc = { _id: 'foo', _rev: '1-abc', name: 'test' };
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(200, doc));

			// When the document is fetched
			// Then it should be returned as-is
			await expect(db.get('foo')).resolves.toEqual(doc);
		});

		it('encodes the id in the URL', async () => {
			// Given a document id containing a character that requires encoding
			const fetchStub = makeStub(200, { _id: 'foo/bar', _rev: '1-abc' });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the document is fetched
			await db.get('foo/bar');

			// Then the id should be percent-encoded in the URL
			const url = fetchStub.mock.calls[0][0] as URL;
			expect(url.pathname).toContain('foo%2Fbar');
		});

		it('throws CouchDBNotFoundError on 404', async () => {
			// Given the document does not exist
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(404, {}));

			// When the document is fetched
			// Then a CouchDBNotFoundError should be thrown
			await expect(db.get('missing')).rejects.toThrow(CouchDBNotFoundError);
		});
	});

	describe('insert', () => {
		it('returns created response on success', async () => {
			// Given a valid document to insert
			const created = { id: 'foo', rev: '1-abc', ok: true };
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(201, created));

			// When the document is inserted
			// Then the created response should be returned
			await expect(db.insert({ name: 'test' })).resolves.toEqual(created);
		});

		it('throws CouchDBDocumentUpdateConflict if doc includes _rev', async () => {
			// Given a document that incorrectly includes a _rev field
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(201, {}));

			// When the document is inserted
			// Then a CouchDBDocumentUpdateConflict should be thrown before the request is made
			await expect(db.insert({ _rev: '1-abc' } as never)).rejects.toThrow(
				CouchDBDocumentUpdateConflict,
			);
		});

		it('throws CouchDBNotFoundError on 404', async () => {
			// Given the database does not exist
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(404, {}));

			// When the document is inserted
			// Then a CouchDBNotFoundError should be thrown
			await expect(db.insert({ name: 'test' })).rejects.toThrow(
				CouchDBNotFoundError,
			);
		});

		it('throws CouchDBDocumentUpdateConflict on 409', async () => {
			// Given a document with an id that already exists
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(409, {}));

			// When the document is inserted
			// Then a CouchDBDocumentUpdateConflict should be thrown
			await expect(db.insert({ name: 'test' })).rejects.toThrow(
				CouchDBDocumentUpdateConflict,
			);
		});
	});

	describe('replace', () => {
		it('returns created response on success', async () => {
			// Given a document to replace with a valid id and rev
			const created = { id: 'foo', rev: '2-abc', ok: true };
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(201, created));

			// When the document is replaced
			// Then the created response should be returned
			await expect(
				db.replace('foo', '1-abc', { name: 'test' }),
			).resolves.toEqual(created);
		});

		it('includes rev as a query parameter', async () => {
			// Given a document to replace with a valid id and rev
			const fetchStub = makeStub(201, { id: 'foo', rev: '2-abc', ok: true });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the document is replaced
			await db.replace('foo', '1-abc', { name: 'test' });

			// Then the rev should be passed as a query parameter
			const url = fetchStub.mock.calls[0][0] as URL;
			expect(url.searchParams.get('rev')).toBe('1-abc');
		});

		it('throws CouchDBNotFoundError on 404', async () => {
			// Given the document does not exist
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(404, {}));

			// When the document is replaced
			// Then a CouchDBNotFoundError should be thrown
			await expect(db.replace('foo', '1-abc', {})).rejects.toThrow(
				CouchDBNotFoundError,
			);
		});

		it('throws CouchDBDocumentUpdateConflict on 409', async () => {
			// Given the rev does not match the current revision
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(409, {}));

			// When the document is replaced
			// Then a CouchDBDocumentUpdateConflict should be thrown
			await expect(db.replace('foo', '1-abc', {})).rejects.toThrow(
				CouchDBDocumentUpdateConflict,
			);
		});
	});

	describe('remove', () => {
		it('returns created response on success', async () => {
			// Given a document to remove with a valid id and rev
			const created = { id: 'foo', rev: '2-abc', ok: true };
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(200, created));

			// When the document is removed
			// Then the created response should be returned
			await expect(db.remove('foo', '1-abc')).resolves.toEqual(created);
		});

		it('includes rev as a query parameter', async () => {
			// Given a document to remove with a valid id and rev
			const fetchStub = makeStub(200, { id: 'foo', rev: '2-abc', ok: true });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the document is removed
			await db.remove('foo', '1-abc');

			// Then the rev should be passed as a query parameter
			const url = fetchStub.mock.calls[0][0] as URL;
			expect(url.searchParams.get('rev')).toBe('1-abc');
		});

		it('throws CouchDBNotFoundError on 404', async () => {
			// Given the document does not exist
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(404, {}));

			// When the document is removed
			// Then a CouchDBNotFoundError should be thrown
			await expect(db.remove('foo', '1-abc')).rejects.toThrow(
				CouchDBNotFoundError,
			);
		});

		it('throws CouchDBDocumentUpdateConflict on 409', async () => {
			// Given the rev does not match the current revision
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(409, {}));

			// When the document is removed
			// Then a CouchDBDocumentUpdateConflict should be thrown
			await expect(db.remove('foo', '1-abc')).rejects.toThrow(
				CouchDBDocumentUpdateConflict,
			);
		});
	});

	describe('query', () => {
		it('should return view results on success', async () => {
			// Given a view query and a successful response
			const results: CouchDBViewQueryResponse<string, string, never> = {
				total_rows: 2,
				offset: 0,
				rows: [
					{ id: 'foo', key: 'foo', value: 'bar' },
					{ id: 'baz', key: 'baz', value: 'qux' },
				],
			};
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(200, results));

			// When the query is executed
			// Then the results should be returned
			await expect(
				db.query(new ViewQuery('test-doc', 'test-view')),
			).resolves.toEqual(results);
		});

		it('should use GET when there is no post data', async () => {
			// Given a query with no post data
			const fetchStub = makeStub(200, { total_rows: 0, offset: 0, rows: [] });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the query is executed
			await db.query(new ViewQuery('test-doc', 'test-view'));

			// Then the request should use GET
			expect(fetchStub.mock.calls[0][1].method).toBe('GET');
		});

		it('should use POST when there is post data', async () => {
			// Given a query with multiple keys requiring post data
			const fetchStub = makeStub(200, { total_rows: 0, offset: 0, rows: [] });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the query is executed
			await db.query(
				new ViewQuery('test-doc', 'test-view').keys(['foo', 'bar']),
			);

			// Then the request should use POST
			expect(fetchStub.mock.calls[0][1].method).toBe('POST');
		});

		it('should include post data in the request body', async () => {
			// Given a query with multiple keys
			const fetchStub = makeStub(200, { total_rows: 0, offset: 0, rows: [] });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the query is executed
			await db.query(
				new ViewQuery('test-doc', 'test-view').keys(['foo', 'bar']),
			);

			// Then the request body should contain the keys
			expect(JSON.parse(fetchStub.mock.calls[0][1].body)).toEqual({
				keys: ['foo', 'bar'],
			});
		});

		it('should construct the correct URL for the view', async () => {
			// Given a view query
			const fetchStub = makeStub(200, { total_rows: 0, offset: 0, rows: [] });
			const db = new SofaSurfer(CONNECTION_STRING, fetchStub);

			// When the query is executed
			await db.query(new ViewQuery('test-doc', 'test-view'));

			// Then the URL should point to the correct view
			const url = fetchStub.mock.calls[0][0] as URL;
			expect(url.pathname).toContain('_design/test-doc/_view/test-view');
		});

		it('should throw CouchDBNotFoundError on 404', async () => {
			// Given the view does not exist
			const db = new SofaSurfer(CONNECTION_STRING, makeStub(404, {}));

			// When the query is executed
			// Then a CouchDBNotFoundError should be thrown
			await expect(
				db.query(new ViewQuery('test-doc', 'test-view')),
			).rejects.toThrow(CouchDBNotFoundError);
		});
	});
});
