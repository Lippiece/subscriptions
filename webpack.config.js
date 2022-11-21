import path from "node:path";
import url from "node:url";
import glob from "glob";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
export default {
  entry: glob.sync("./src/**/*.js"),
  // entry    : "/src/main/script.js",
  mode: "development",
  devtool: "inline-source-map",
  experiments: {
    topLevelAwait: true,
  },
  optimization: {
    runtimeChunk: "single",
    usedExports: true,
    splitChunks: {
      chunks: "all",
    }
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Subscriptions",
      templateContent: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Subscriptions</title>
            <link rel="stylesheet" href="https://meyerweb.com/eric/tools/css/reset/reset.css" type="text/css" />
          </head>`
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|jfif|webp)$/i,
        type: "asset",
      },
      // compress images
      {
        test: /\.(png|svg|jpg|jpeg|gif|jfif|webp)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            // enforce: "pre",
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminGenerate,
                options: {
                  plugins: [
                    "imagemin-gifsicle",
                    "imagemin-mozjpeg",
                    "imagemin-pngquant",
                    "imagemin-svgo",
                  ],
                },
              },
            },
          },
        ],
      },
      {
        test: /\.m?js/,
        type: "javascript/auto",
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  devServer: {
    compress: true,
    port: 9000,
  },
};
