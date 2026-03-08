import * as esbuild from "esbuild"

const env = process.env.NODE_ENV ?? "production"

switch (env) {
  case "production": {
    const { default: babelPlugin } = await import("esbuild-plugin-babel")
    const ctx = await esbuild.context({
      entryPoints: ["app/App.tsx"],
      bundle: true,
      minify: true,
      outfile: "dist/static/app.js",
      plugins: [
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
      ],
    })
    await ctx.rebuild()
    await ctx.dispose()
    break
  }
  case "development": {
    const ctx = await esbuild.context({
      entryPoints: ["app/App.tsx"],
      bundle: true,
      outfile: "static/app.js",
    })
    console.log("Watching for changes...")
    await ctx.watch()
    break
  }
}
