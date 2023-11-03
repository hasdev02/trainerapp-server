import crypto, { ScryptOptions } from "crypto";
import os from "os";

export default class Scrypt {
	private static work(pass: string, salt: string, memoryCostFactor: number, cb: (err: Error | null, buffer?: Buffer) => void) {
		const N = 2 ** memoryCostFactor;
		if (128 * N * 9 > os.freemem()) {
			cb(new Error("Insufficient memory"));
		}
		const options: ScryptOptions = {
			N,
			maxmem: 128 * N * 9,
		};
		crypto.scrypt(pass, salt, 32, options, cb);
	}

	/**
	 * Hash password with Scrypt
	 * @param pass Password
	 * @param costFactor The more cost factor, the more hashing time (also when verifying password). Recommended minimum and default value of 14
	 * @returns 100 chars length string
	 */
	static hash(pass: string, memoryCostFactor = 14): Promise<string> {
		return new Promise((res, rej) => {
			crypto.randomBytes(16, (err, buffer) => {
				if (err) return rej(err);

				const salt = buffer.toString("hex");
				Scrypt.work(pass, salt, memoryCostFactor, (err, key) => {
					if (err || !key) return rej(err);

					res(`${`00${memoryCostFactor}`.slice(-2)}$${salt}$${key.toString("hex")}`);
				});
			});
		});
	}

	/**
	 * Check if given password is equal to hash data
	 * @param pass Password
	 * @param hash Password hash
	 * @returns Boolean
	 */
	static verify(pass: string, hash: string): Promise<boolean> {
		return new Promise((res, rej) => {
			const [hashCostFactor, hashSalt, hashKey] = hash.split("$");
			Scrypt.work(pass, hashSalt, Number(hashCostFactor), (err, key) => {
				if (err || !key) return rej(err);

				res(hashKey === key.toString("hex"));
			});
		});
	}
}

export const { hash, verify } = {
	hash: Scrypt.hash,
	verify: Scrypt.verify,
};
