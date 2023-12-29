import { ViewQuery } from './view-query';

describe('querying by key', () => {
	test('views with no arguments', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	test('loading a single key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key('fake-key');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=%22fake-key%22&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	test('loading a compound key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(['my-key', {}]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'key=%5B%22my-key%22%2C%7B%7D%5D&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	test('requesting a boolean true key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=true&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	test('requesting a boolean false key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=false&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	test('requesting a null key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(null);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=null&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});
});

describe('querying many keys', () => {
	test('requesting multiple keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys(['test-key']);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: ['test-key'] });
	});

	test('requesting multiple boolean keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys([true, false]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: [true, false] });
	});

	test('requesting multiple null keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys([null]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: [null] });
	});
});

describe('specifiying sort order', () => {
	test('descending sort order', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').order(
			ViewQuery.DESCENDING,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=true&reduce=false',
		);
	});

	test('ascending sort order', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').order(
			ViewQuery.ASCENDING,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=false&reduce=false',
		);
	});

	test('overriding sort order', () => {
		expect.assertions(3);

		const query = new ViewQuery('test-doc', 'test-view').order(
			ViewQuery.ASCENDING,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=false&reduce=false',
		);

		query.order(ViewQuery.DESCENDING);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=true&reduce=false',
		);

		query.order(ViewQuery.ASCENDING);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=false&reduce=false',
		);
	});
});

describe('naive pagination', () => {
	test('setting skip and limit', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').skip(10).limit(5);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?limit=5&reduce=false&skip=10',
		);
	});
});

describe('inlining documents', () => {
	test('inlining documents', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').includeDocs();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?include_docs=true&reduce=false',
		);
	});

	test('explicitly refusing documents', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').includeDocs(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?include_docs=false&reduce=false',
		);
	});
});

describe('querying by range', () => {
	test('loading keys by range', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').range('123', 'abc');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%22abc%22&inclusive_end=false&reduce=false&startkey=%22123%22',
		);
	});

	test('loading keys by compound range', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').range(
			['abc'],
			['abc', {}],
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%5B%22abc%22%2C%7B%7D%5D&inclusive_end=false' +
				'&reduce=false&startkey=%5B%22abc%22%5D',
		);
	});

	test('loading keys with inclusive end', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').range(
			'123',
			'abc',
			ViewQuery.INCLUDE_END,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%22abc%22&inclusive_end=true&reduce=false&startkey=%22123%22',
		);
	});

	test('loading keys with excluded end', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').range(
			'123',
			'abc',
			ViewQuery.EXCLUDE_END,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%22abc%22&inclusive_end=false&reduce=false&startkey=%22123%22',
		);
	});

	test('loading document subkeys', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view')
			.range(['123'], ['123', {}])
			.idRange('earlydoc', 'laterdoc');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%5B%22123%22%2C%7B%7D%5D&endkey_docid=laterdoc' +
				'&inclusive_end=false&reduce=false&startkey=%5B%22123%22%5D' +
				'&startkey_docid=earlydoc',
		);
	});
});

describe('refreshing indicies', () => {
	test('request stale data at run time', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_NONE,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=true&update=false',
		);
	});

	test('lazy update data at run time', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_AFTER,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=true&update=lazy',
		);
	});

	test('explicitly update index before return', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_BEFORE,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=false&update=true',
		);
	});

	test('implicitly update index before return', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=false&update=true',
		);
	});
});

describe('reducing and grouping data sets', () => {
	test('setting reduce flag', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	test('setting reduce flag to false', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});

	test('default reduce to true if no argument', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	test('setting group flag', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	test('enable grouping with no argument', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	test('recoginise group_level=0 is the same as group=true', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(0);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	test('disable grouping', () => {
		expect.assertions(1);
		const query = new ViewQuery('test-doc', 'test-view').group(false);
		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});

	test('should not reset reduce when disabling grouping', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce().group(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	test('setting specific group levels', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(1);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=1&reduce=true',
		);
	});

	test('override group with group level', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(true).group(1);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=1&reduce=true',
		);
	});

	test('override group level with group', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(1).group(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	test('discard float group level', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(Math.PI);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=3&reduce=true',
		);
	});

	test('throw for invalid group levels', () => {
		expect.assertions(1);

		expect(() => new ViewQuery('test-doc', 'test-view').group(-1)).toThrow(
			'Group level must be boolean or positive integer',
		);
	});
});
