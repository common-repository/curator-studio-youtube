export default {
	platform: 'youtube',
	class_prefix: 'cs',
	versions: {
		dom: '0.1'
	},
	source: {
		limit: {
			any: 6
		}
	},
	pagination: {
		items: 6,
		comments: 10
	},
	apps: {
		streams: true,
		singles: true
	},
	...(window.cs_editor_vars||{})
};
