import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["app/app.tsx"],
  bundle: true,
  minify: true,
  outfile: "static/app.js",
});

if (isWatch) {
  console.log("Watching for changes...");
  await ctx.watch();
} else {
  console.log("Building once...");
  await ctx.rebuild();
  await ctx.dispose();
}
