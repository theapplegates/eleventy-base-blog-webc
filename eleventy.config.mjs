import { DateTime } from "luxon";
import markdownItAnchor from "markdown-it-anchor";

import rssPlugin from "@11ty/eleventy-plugin-rss";
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";
import bundlePlugin from "@11ty/eleventy-plugin-bundle";
import navigationPlugin from "@11ty/eleventy-navigation";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

import eleventyWebcPlugin from "@11ty/eleventy-plugin-webc";
import { eleventyImagePlugin, imageShortcode } from "@11ty/eleventy-img";
import pluginDrafts from "./eleventy.config.drafts.js";
import pluginImages from "./eleventy.config.images.js";

export default function(eleventyConfig) {
		// Copy the contents of the `public` folder to the output folder
		eleventyConfig.addPassthroughCopy({
				"./public/": "/",
				"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
		});

		// Watch content images for the image pipeline.
		eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

		// Register plugins
		eleventyConfig.addPlugin(eleventyWebcPlugin, {
				components: [
						"npm:@11ty/eleventy-img/*.webc",
				]
		});
		eleventyConfig.addPlugin(pluginDrafts);
		eleventyConfig.addPlugin(pluginImages);
		eleventyConfig.addPlugin(eleventyImagePlugin, {
				formats: ["webp", "jpeg"],
				urlPath: "../content/",
				defaultAttributes: {
						loading: "lazy",
						decoding: "async"
				}
		});

		// Official plugins
		eleventyConfig.addPlugin(rssPlugin);
		eleventyConfig.addPlugin(syntaxHighlightPlugin, {
				preAttributes: {tabindex: 0}
		});
		eleventyConfig.addPlugin(navigationPlugin);
		eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
		eleventyConfig.addPlugin(bundlePlugin);

		// Register the image shortcode
		eleventyConfig.addShortcode("image", imageShortcode);

		// Filters
		eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
				return DateTime.fromJSDate(dateObj, {zone: zone || "utc"}).toFormat(format || "dd LLLL yyyy");
		});

		eleventyConfig.addFilter('htmlDateString', (dateObj) => {
				return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
		});

		eleventyConfig.addFilter("head", (array, n) => {
				if (!Array.isArray(array) || array.length === 0) {
						return [];
				}
				if (n < 0) {
						return array.slice(n);
				}
				return array.slice(0, n);
		});

		eleventyConfig.addFilter("min", (...numbers) => {
				return Math.min.apply(null, numbers);
		});

		eleventyConfig.addFilter("getAllTags", collection => {
				let tagSet = new Set();
				for (let item of collection) {
						(item.data.tags || []).forEach(tag => tagSet.add(tag));
				}
				return Array.from(tagSet);
		});

		eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
				return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
		});

		eleventyConfig.amendLibrary("md", mdLib => {
				mdLib.use(markdownItAnchor, {
						permalink: markdownItAnchor.permalink.ariaHidden({
								placement: "after",
								class: "header-anchor",
								symbol: "#",
								ariaHidden: false,
						}),
						level: [1, 2, 3, 4],
						slugify: eleventyConfig.getFilter("slugify")
				});
		});

		return {
				templateFormats: [
						"md",
						"njk",
						"html",
						"liquid",
				],
				markdownTemplateEngine: "njk",
				htmlTemplateEngine: "njk",
				dir: {
						input: "content",
						includes: "../_includes",
						data: "../_data",
						output: "_site"
				},
				pathPrefix: "/",
		};
}
