# Sofa Surfer

A lightweight CouchDB client for Node.js and Deno.

## Background

I've written this library many times for different projects and decided to just publish a version I can reuse.

## Installation

```bash
npm install sofa-surfer
```

## Usage

`sofa-surfer` exposes a `SofaSurfer` class. I wanted this to be a plain object, but TypeScript wasn't happy with that. I blame .NET. Anyway.

Pass a connection string including credentials, host, port, and database name:

```js
import { SofaSurfer } from 'sofa-surfer';

// e.g. COUCHDB_URL=http://user:password@localhost:5984/mydb
const db = new SofaSurfer(process.env.COUCHDB_URL);
const doc = await db.get('my-document-id');
```

## API

### `SofaSurfer`

#### `new SofaSurfer(connectionString)`

The connection string should be a full URL with credentials, host, port, and database name:

```
http://username:password@localhost:5984/mydb
```

Credentials are stripped from the URL before any requests are made, so you won't accidentally leak them into logs.

#### `.get(id)`

Fetches a single document by id. Throws `CouchDBNotFoundError` if it doesn't exist.

```js
const doc = await db.get('my-document-id');
```

#### `.insert(doc)`

Creates a new document. Optionally include `_id` to specify the document id — otherwise CouchDB will generate one for you.

```js
const result = await db.insert({ name: 'Alice', type: 'user' });
const result = await db.insert({
	_id: 'user-alice',
	name: 'Alice',
	type: 'user',
});
```

Don't include `_rev` — that's what `.replace()` is for. If you try, it'll throw.

#### `.replace(id, rev, doc)`

Replaces an existing document. You must provide the current `_rev` or CouchDB will reject it with a conflict. This is CouchDB's way of keeping you honest.

```js
const result = await db.replace('user-alice', '1-abc123', {
	name: 'Alice',
	type: 'user',
});
```

#### `.remove(id, rev)`

Deletes a document.

```js
const result = await db.remove('user-alice', '2-def456');
```

#### `.query(viewQuery)`

Runs a view query. See `ViewQuery` below.

```js
const { rows } = await db.query(query);
```

---

### `ViewQuery`

`sofa-surfer` also exposes a `ViewQuery` class for running CouchDB map-reduce view queries. It's much nicer to use than joining strings.

```js
import { SofaSurfer, ViewQuery } from 'sofa-surfer';

const db = new SofaSurfer(process.env.COUCHDB_URL);

const query = new ViewQuery('design-doc-name', 'view-name').key(
	'my-emitted-key',
);
const { rows } = await db.query(query);
```

`ViewQuery` methods return `this` so calls can be chained to your heart's content:

```js
const today = getCurrentDate();

const query = new ViewQuery('design-doc-name', 'view-name')
	.range([today], [today, {}])
	.update(ViewQuery.UPDATE_AFTER)
	.includeDocs()
	.limit(10);

const { rows } = await db.query(query);
```

#### Querying by key

```js
new ViewQuery('ddoc', 'view').key('my-key');
new ViewQuery('ddoc', 'view').keys(['key-one', 'key-two']);
```

#### Querying by range

```js
// Exclude end key (default)
new ViewQuery('ddoc', 'view').range('aaa', 'zzz');

// Include end key
new ViewQuery('ddoc', 'view').range('aaa', 'zzz', ViewQuery.INCLUDE_END);

// Compound keys
new ViewQuery('ddoc', 'view').range(['2024'], ['2024', {}]);

// With document id subkeys for pagination
new ViewQuery('ddoc', 'view')
	.range(['2024'], ['2024', {}])
	.idRange('first-doc-id', 'last-doc-id');
```

#### Pagination

```js
new ViewQuery('ddoc', 'view').skip(20).limit(10);
```

#### Sorting

```js
new ViewQuery('ddoc', 'view').order(ViewQuery.DESCENDING);
new ViewQuery('ddoc', 'view').order(ViewQuery.ASCENDING);
```

#### Including documents

```js
new ViewQuery('ddoc', 'view').includeDocs();
```

#### Reduce and grouping

```js
new ViewQuery('ddoc', 'view').reduce(); // run reduce
new ViewQuery('ddoc', 'view').reduce(false); // skip reduce
new ViewQuery('ddoc', 'view').group(); // group all
new ViewQuery('ddoc', 'view').group(1); // group_level=1
new ViewQuery('ddoc', 'view').group(false); // disable grouping
```

#### Index freshness

```js
// Update index before returning (default)
new ViewQuery('ddoc', 'view').update(ViewQuery.UPDATE_BEFORE);

// Return stale data, update index afterward
new ViewQuery('ddoc', 'view').update(ViewQuery.UPDATE_AFTER);

// Return stale data, do not update index. Living dangerously.
new ViewQuery('ddoc', 'view').update(ViewQuery.UPDATE_NONE);
```
