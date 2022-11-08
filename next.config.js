/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
      exclude: /public/,
			use: ['@svgr/webpack'],
		});

    config.module.rules.forEach((rule) => {
      const { oneOf } = rule;
      if (oneOf) {
        oneOf.forEach((one) => {
          if (!`${one.issuer?.and}`.includes('_app')) return;
          one.issuer.and = [path.resolve(__dirname)];
        });
      }
    });

		return config;
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'https://digital.gpmarinelitter.org/api/:path*',
			},
			{
				source: '/image/:path*',
				destination: 'https://digital.gpmarinelitter.org/image/:path*',
			},
		];
	},
	experimental: {
		images: {
			layoutRaw: true,
		},
	},
};

module.exports = nextConfig;
