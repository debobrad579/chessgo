import * as esbuild from "esbuild"

const isWatch = process.argv.includes("--watch")

const plugins = []

if (!isWatch) {
  const { default: babelPlugin } = await import("esbuild-plugin-babel")
  plugins.push(
    babelPlugin({
      config: {
        presets: [
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: ["babel-plugin-react-compiler"],
      },
      filter: /\.tsx?$/,
      ignore: /node_modules/,
    }),
  )
}

const ctx = await esbuild.context({
  entryPoints: ["app/App.tsx"],
  bundle: true,
  minify: true,
  outfile: "static/app.js",
  plugins,
})

if (isWatch) {
  console.log("Watching for changes...")
  await ctx.watch()
} else {
  console.log("Building once...")
  await ctx.rebuild()
  await ctx.dispose()
}
