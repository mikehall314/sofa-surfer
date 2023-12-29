# Sofa Surfer

Another way to access CouchDB from NodeJS.

## Background

Honestly, I have written this library so many times for different projects and I decided to just publish a version I can re-use.

## How to use it

`sofa-surfer` exposes a `SofaSurfer` class. I wanted this to be a plain object, but TypeScript wasn't happy with that. I blame .NET. Anyway.

Init `SofaSurfer` with the path to your CouchDB host and then you can query Couch easily.

```js
const { SofaSurfer } = require('sofa-surfer');
const db = new SofaSurfer(process.env.COUCHDB_HOST);
const doc = await db.get('my-couch-id');
```

### API

`.get(id)` - Load a single CouchDB document
`.insert(doc)` - Create a CouchDB document
`.replace(id, rev, doc)` - Replace an old document with a new document
`.remove(id, rev)` - Remove a document
`.use(dbname)` - Change which database we are reading from
`.query(viewQuery)` Perform a query with a `ViewQuery` object.

### The `ViewQuery` object

`sofa-surfer` also exposes a class named `ViewQuery` which you can use to run a map-reduce query.

```js
const { SofaSurfer, ViewQuery } = require('sofa-surfer');
const db = new SofaSurfer(process.env.COUCHDB_HOST);
const query = new ViewQuery('design-doc-name', 'view-name').key(
	'my-emitted-key',
);
const { rows } = await db.query(query);
```

The `ViewQuery` object allows to query by key, keys, range, etc.

### `ViewQuery` API

`.key(key)` - query a single key
`.keys(array_of_keys)` - query several keys
`.range(startkey, endkey)` - Query a range of keys.
`.range(startkey, endkey, ViewQuery.INCLUDE_END)` - Query a range if keys, including the `endkey`
`.idRange(startkey_docid, endkey_docid)` - subkeys for CouchDB pagination. Use in combination with `.range()`
`.skip(n)` - skips `n` rows
`.limit(n)` - return just `n` rows
`.includeDocs()` - include the original document
`.order(ViewQuery.DESCENDING)` - Sort the rows in descending order.
`.order(ViewQuery.ASCENDING)` - Sort the rows in ascending order.
`.reduce()` - run the reduce function
`.reduce(false)` - don't run the reduce function
`.group()` - group the results
`.group(false)` - don't group the results
`.group(1)` - set the `group_level` to `1`
`.update(ViewQuery.UPDATE_BEFORE)` - Ensure the index is up to date before returning rows
`.update(ViewQuery.UPDATE_AFTER)` - Return stale data this time, but update the index afterward.
`.update(ViewQuery.UPDATE_NONE)` - Return stale data.

The `ViewQuery` object returns itself, so calls can be chained:

```js
const { ViewQuery } = require('sofa-surfer');
const today = getCurrentDate();
const query = new ViewQuery('design-doc-name', 'view-name')
	.range([today], [today, {}])
	.update(ViewQuery.UPDATE_AFTER)
	.includeDocs()
	.limit(10);
const { rows } = await db.query(query);
```
