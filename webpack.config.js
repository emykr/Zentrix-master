const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: '/',
    clean: true,
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // 컴파일 속도 향상
            configFile: path.resolve(__dirname, './tsconfig.json'),
            compilerOptions: {
              module: 'ESNext',
              moduleResolution: 'bundler',
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@handler': path.resolve(__dirname, 'src/handler'),
      '@lang': path.resolve(__dirname, 'src/lang'),
    },
    fallback: {
      path: require.resolve('path-browserify'),
      url: false, // url 모듈은 사용하지 않으므로 false로 설정
      fs: false,
      os: require.resolve('os-browserify/browser'),
      util: require.resolve('util'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true,
    }),
    new Dotenv(), // .env 파일 로드
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            pure_funcs: ['console.log'],
            drop_debugger: true,
            dead_code: true,
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    historyApiFallback: true,
    hot: true,
    compress: true,
    port: 3000,
    open: true,
    host: 'localhost',
    proxy: [
      {
        context: ['/fonts'],
        target: 'http://fonts.emykr.xyz:3001',
        changeOrigin: true,
      },
      {
        context: ['/api'],
        target: 'http://api.emykr.xyz:3002',
        changeOrigin: true,
      },
      {
        context: ['/download'],
        target: 'http://download.emykr.xyz:3003',
        changeOrigin: true,
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  stats: {
    errorDetails: true,
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
};