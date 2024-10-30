export default {
	'li-author': {
		tag: 'div', 
		name: 'Author', 
		component: 'Author', 
		eclasses: [
			['spacing', {ma: 'ma-normal'}]
		]
	},
	'li-text': {
		tag: 'div', 
		name: 'Text', 
		component: 'TextContent', 
		eclasses: [
			['spacing', {pa: 'pa-normal', pt: 'pt-none'}]
		]
	},
	'li-media': {
		tag: 'div', 
		name: 'Media', 
		component: 'Media', 
		eclasses: ['spacing']
	},
	'li-link-box': {
		tag: 'div', 
		name: 'Link Box', 
		component: 'LinkBox', 
		classes:['bc-shadea2'], 
		eclasses: [
			['spacing', {pa: 'pa-normal'}], 
			'borders'
		]
	},
	'li-stats': {
		tag: 'div', 
		name: 'Stats', 
		component: 'Stats', 
		eclasses: ['spacing']
	},
	'li-comments': {
		tag: 'div',
		component: 'Comments',
		name: 'Comments',
		config: {
			classes: {
				avatar: {
					round: ''
				}
			}
		},
		schema: 'li-comments',
		eclasses: [
			['spacing', {ma: 'ma-normal'}]
		]
	}
};
