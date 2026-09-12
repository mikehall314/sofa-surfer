declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation
	interface Uint8Array {
		toBase64: () => string;
	}
}

export {};
