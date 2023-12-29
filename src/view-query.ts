import type { SerializableValue } from './types';

const EXCLUDE_END = 'exclusive_end' as const;
const INCLUDE_END = 'inclusive_end' as const;
const ASCENDING = 'ascending' as const;
const DESCENDING = 'descending' as const;
const UPDATE_BEFORE = 'update_before' as const;
const UPDATE_AFTER = 'update_after' as const;
const UPDATE_NONE = 'update_none' as const;

type GroupLevel = number | boolean;
type RowOrder = typeof ASCENDING | typeof DESCENDING;
type UpdateMode =
	| typeof UPDATE_BEFORE
	| typeof UPDATE_AFTER
	| typeof UPDATE_NONE;
type RangeInclusion = typeof INCLUDE_END | typeof EXCLUDE_END;

export class ViewQuery {
	public static EXCLUDE_END = EXCLUDE_END;
	public static INCLUDE_END = INCLUDE_END;
	public static ASCENDING = ASCENDING;
	public static DESCENDING = DESCENDING;
	public static UPDATE_BEFORE = UPDATE_BEFORE;
	public static UPDATE_AFTER = UPDATE_AFTER;
	public static UPDATE_NONE = UPDATE_NONE;

	private options = new URLSearchParams({ reduce: 'false' });
	private postoptions = new Map<'keys', SerializableValue>();

	constructor(
		private readonly ddoc: string,
		private readonly name: string,
	) {}

	key(key: SerializableValue) {
		this.options.set('key', JSON.stringify(key));
		return this;
	}

	keys(keys: SerializableValue[]) {
		if (Array.isArray(keys) === false) {
			throw new TypeError('keys must be an array of keys');
		}

		this.postoptions.set('keys', keys);
		return this;
	}

	range(
		start: SerializableValue,
		end: SerializableValue,
		include: RangeInclusion = EXCLUDE_END,
	) {
		this.options.set('startkey', JSON.stringify(start));
		this.options.set('endkey', JSON.stringify(end));

		if (include === EXCLUDE_END) {
			this.options.set('inclusive_end', 'false');
		}

		if (include === INCLUDE_END) {
			this.options.set('inclusive_end', 'true');
		}

		return this;
	}

	idRange(start: string, end: string) {
		this.options.set('startkey_docid', start);
		this.options.set('endkey_docid', end);
		return this;
	}

	group(level: GroupLevel = true) {
		if (level === true || level === 0) {
			this.options.set('reduce', 'true');
			this.options.set('group', 'true');
			this.options.delete('group_level');
			return this;
		}

		if (level === false) {
			this.options.delete('group');
			this.options.delete('group_level');
			return this;
		}

		if (level >= 0) {
			this.options.set('reduce', 'true');
			this.options.delete('group');
			this.options.set('group_level', level.toFixed(0));
			return this;
		}

		throw new TypeError('Group level must be boolean or positive integer');
	}

	includeDocs(please = true) {
		this.options.set('include_docs', Boolean(please).toString());
		return this;
	}

	limit(n: number) {
		this.options.set('limit', Number(n).toFixed(0));
		return this;
	}

	reduce(please = true) {
		this.options.set('reduce', Boolean(please).toString());
		return this;
	}

	order(sort: RowOrder) {
		const descending = sort === DESCENDING;
		this.options.set('descending', Boolean(descending).toString());
		return this;
	}

	update(mode: UpdateMode = UPDATE_BEFORE) {
		if (mode === UPDATE_BEFORE) {
			this.options.set('stable', 'false');
			this.options.set('update', 'true');
		} else if (mode === UPDATE_AFTER) {
			this.options.set('stable', 'true');
			this.options.set('update', 'lazy');
		} else if (mode === UPDATE_NONE) {
			this.options.set('stable', 'true');
			this.options.set('update', 'false');
		} else {
			throw new TypeError(
				'Update mode must be one of UPDATE_BEFORE, UPDATE_AFTER, or UPDATE_NONE',
			);
		}
		return this;
	}

	skip(n: number) {
		this.options.set('skip', n.toFixed(0));
		return this;
	}

	hasPostData() {
		return this.postoptions.size > 0;
	}

	postData(): Record<string, SerializableValue> {
		const body = Object.create(null);
		this.postoptions.forEach((value, key) => (body[key] = value));
		return body;
	}

	toString() {
		this.options.sort();
		return (
			`_design/${encodeURIComponent(this.ddoc)}/` +
			`_view/${encodeURIComponent(this.name)}` +
			`?${this.options}`
		);
	}
}
