import { describe, it, expect } from 'vitest';
import { ViewQuery } from './view-query.ts';

describe('querying by key', () => {
	it('should produce correct URL with no arguments', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	it('should produce correct URL for a single key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key('fake-key');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=%22fake-key%22&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	it('should produce correct URL for a compound key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(['my-key', {}]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'key=%5B%22my-key%22%2C%7B%7D%5D&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	it('should produce correct URL for a boolean true key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=true&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	it('should produce correct URL for a boolean false key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=false&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});

	it('should produce correct URL for a null key', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').key(null);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?key=null&reduce=false',
		);
		expect(query.hasPostData()).toBeFalsy();
	});
});

describe('querying many keys', () => {
	it('should use post data for multiple keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys(['test-key']);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: ['test-key'] });
	});

	it('should use post data for multiple boolean keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys([true, false]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: [true, false] });
	});

	it('should use post data for multiple null keys', () => {
		expect.assertions(2);

		const query = new ViewQuery('test-doc', 'test-view').keys([null]);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
		expect(query.postData()).toEqual({ keys: [null] });
	});
});

describe('specifying sort order', () => {
	it('should set descending sort order', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').order(
			ViewQuery.DESCENDING,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=true&reduce=false',
		);
	});

	it('should set ascending sort order', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').order(
			ViewQuery.ASCENDING,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?descending=false&reduce=false',
		);
	});

	it('should allow sort order to be overridden', () => {
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
	it('should set skip and limit in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').skip(10).limit(5);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?limit=5&reduce=false&skip=10',
		);
	});

	it('should throw for a negative limit', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view');

		expect(() => query.limit(-1)).toThrow(TypeError);
	});

	it('should omit limit from the URL when given Infinity', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').limit(Infinity);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});

	it('should allow a previously set limit to be cleared with Infinity', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view')
			.limit(5)
			.limit(Infinity);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});
});

describe('inlining documents', () => {
	it('should include docs in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').includeDocs();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?include_docs=true&reduce=false',
		);
	});

	it('should explicitly exclude docs when passed false', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').includeDocs(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?include_docs=false&reduce=false',
		);
	});
});

describe('querying by range', () => {
	it('should set startkey and endkey in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').range('123', 'abc');

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'endkey=%22abc%22&inclusive_end=false&reduce=false&startkey=%22123%22',
		);
	});

	it('should set compound startkey and endkey in the URL', () => {
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

	it('should set inclusive_end=true when requested', () => {
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

	it('should set inclusive_end=false when explicitly excluded', () => {
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

	it('should set startkey_docid and endkey_docid for document subkey ranges', () => {
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

describe('refreshing indices', () => {
	it('should request stale data when update is none', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_NONE,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=true&update=false',
		);
	});

	it('should request lazy update when update is after', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_AFTER,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=true&update=lazy',
		);
	});

	it('should update index before returning when update is before', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update(
			ViewQuery.UPDATE_BEFORE,
		);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=false&update=true',
		);
	});

	it('should update index before returning when no argument is given', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').update();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?' +
				'reduce=false&stable=false&update=true',
		);
	});
});

describe('reducing and grouping data sets', () => {
	it('should set reduce=true in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	it('should set reduce=false in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});

	it('should default reduce to true when no argument is given', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	it('should set group=true in the URL', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	it('should default group to true when no argument is given', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group();

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	it('should treat group_level=0 as group=true', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(0);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	it('should disable grouping when passed false', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=false',
		);
	});

	it('should not reset reduce when disabling grouping', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').reduce().group(false);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?reduce=true',
		);
	});

	it('should set group_level in the URL for specific levels', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(1);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=1&reduce=true',
		);
	});

	it('should override group=true with a specific group level', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(true).group(1);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=1&reduce=true',
		);
	});

	it('should override a specific group level with group=true', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(1).group(true);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group=true&reduce=true',
		);
	});

	it('should floor a float group level to the nearest integer', () => {
		expect.assertions(1);

		const query = new ViewQuery('test-doc', 'test-view').group(Math.PI);

		expect(query.toString()).toBe(
			'_design/test-doc/_view/test-view?group_level=3&reduce=true',
		);
	});

	it('should throw for negative group levels', () => {
		expect.assertions(1);

		expect(() => new ViewQuery('test-doc', 'test-view').group(-1)).toThrow(
			'Group level must be boolean or positive integer',
		);
	});
});
