const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// ENV constant
const ENV = { mode: process.env.NODE_ENV };
ENV.dataUriLimit = 1024;
ENV.isDev = process.env.NODE_ENV === 'development';
ENV.isProd = process.env.NODE_ENV === 'production';
ENV.devtool = ENV.isProd ? 'source-map' : 'cheap-module-eval-source-map';
console.log(`Running webpack in the ${process.env.NODE_ENV} mode`);

// PATH constant
const PATH = { base: __dirname };
PATH.src = path.resolve(PATH.base, 'src');
PATH.styles = path.resolve(PATH.src, 'styles');
PATH.scripts = path.resolve(PATH.src, 'scripts');
PATH.images = path.resolve(PATH.src, 'images');
PATH.assets = path.resolve(PATH.src, 'assets');
PATH.fonts = path.resolve(PATH.src, 'fonts');
PATH.exclude = /(node_modules|bower_components)/;
PATH.externals = {};
PATH.entry = { bundle: './src/index.js' };
PATH.dist = path.resolve(PATH.base, 'static');
PATH.manifest = path.resolve(PATH.base, 'data', 'manifest.json');
PATH.publicPath = ENV.isProd ? '/' : '';
PATH.filename = {
  js: ENV.isProd ? 'js/[name].[chunkhash:10].js' : 'js/[name].js',
  css: ENV.isProd ? 'css/[name].[contentHash:10].css' : 'css/[name].css',
  img: ENV.isProd ? 'img/[name].[hash:10].[ext]' : 'img/[name].[ext]',
  fonts: ENV.isProd ? 'fonts/[name].[hash:10].[ext]' : 'fonts/[name].[ext]',
};

// Genertate loader list
const makeLoaders = env => [
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      `css-loader?sourceMap&importLoaders=1${env.isProd ? '&minimize' : ''}`,
      'postcss-loader?sourceMap',
    ],
    include: PATH.styles,
    exclude: PATH.exclude,
  },
  {
    test: /\.js$/,
    loader: `babel-loader${env.isProd ? '' : '?cacheDirectory'}`,
    include: [
      PATH.scripts,
      path.resolve(PATH.src, 'index.js'),
    ],
    exclude: PATH.exclude,
  },
  {
    test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
    loader: 'url-loader',
    include: PATH.images,
    exclude: PATH.exclude,
    options: {
      limit: env.dataUriLimit,
      name: PATH.filename.img,
      publicPath: '../',
    },
  },
  {
    test: /\.svg(\?.*)?$/,
    loader: 'svg-url-loader',
    include: PATH.images,
    exclude: PATH.exclude,
    options: {
      limit: env.dataUriLimit,
      noquotes: true,
      stripdeclarations: true,
      name: PATH.filename.img,
      publicPath: '../',
    },
  },
  {
    test: /\.(eot|ttf|otf|woff2?|svg)(\?.*)?$/,
    loader: 'url-loader',
    include: PATH.fonts,
    exclude: PATH.exclude,
    options: {
      limit: env.dataUriLimit,
      name: PATH.filename.fonts,
      publicPath: '../',
    },
  },
];

// Genertate plugin list
const makePlugins = (env) => {
  const basePlugins = [
    new MiniCssExtractPlugin({
      filename: PATH.filename.css,
      chunkFilename: PATH.filename.css,
    }),
    new ManifestPlugin({
      fileName: PATH.manifest,
      filter: chunk => chunk.name && /\S*.(js|css)$/.test(chunk.name),
    }),
    new CopyPlugin([
      path.resolve(PATH.assets, 'favicon.ico'),
      {
        from: path.resolve(PATH.assets, '**/*.{png,jpg,jpeg,gif,webp,svg}'),
        to: 'img',
        flatten: true,
        cache: env.isDev,
      },
    ]),
  ];

  // Mode: production
  if (env.isProd) {
    return basePlugins.concat([
      new webpack.HashedModuleIdsPlugin(),
    ]);
  }

  return basePlugins;
};

// Main
module.exports = {
  mode: ENV.mode,
  context: PATH.base,
  entry: PATH.entry,
  externals: PATH.externals,
  output: {
    path: PATH.dist,
    filename: PATH.filename.js,
    publicPath: PATH.publicPath,
  },
  devtool: ENV.devtool,
  module: { rules: makeLoaders(ENV) },
  plugins: makePlugins(ENV),
};
