import('eleventy.config.mjs').then(module => {
		const configFunction = module.default;
		module.exports = configFunction;
}).catch(error => {
		console.error('Error loading Eleventy config:', error);
});
