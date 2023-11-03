import { build } from "esbuild";
import glob from "glob";

build({
	entryPoints: [...glob.sync("./src/**/*.ts")],
	outbase: "./src",
	outdir: "./dist",
	platform: "node",
	target: ["node16"],
	external: [],
	watch: true,
	logLevel: "info",
	format: "esm",
});
