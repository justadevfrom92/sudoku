const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports =
{
	entry: './src/index.tsx',
	module:
	{
		rules:
		[
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve:
	{
		extensions:
		[
			'.tsx',
			'.ts',
			'.js',
		],
	},
	output:
	{
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		// 'auto' resolves asset URLs relative to the page's own location,
		// so the same build works at the site root and under a GitHub Pages
		// project subpath like username.github.io/sudoku-app/.
		publicPath: 'auto',
		clean: true,
	},
	devServer:
	{
		static: './dist',
		port: 3000,
		open: true,
	},
	plugins:
	[
		new HtmlWebpackPlugin(
		{
			template: './public/index.html',
		}),
	],
};
