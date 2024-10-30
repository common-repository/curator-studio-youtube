export default {
	'simple-item': {
		tag: 'div', 
		classes: ['sub-col', 'card', [{rule: {n: 'truthy'}, key: 'local.highlighted'}, ['card--active']]], 
		name:'Simple Item', 
		component: 'StandardItem', 
		type: 'Item', 
		children: [
			'li-author',
			'li-text',
			'li-media',
			'li-link-box'
		]
	},
	'long-item': {
		tag: 'div', 
		name:'Long Item', 
		component: 'LongItem', 
		classes: ['sub-col', 'card', [{rule: {n: 'truthy'}, key: 'local.highlighted'}, ['card--active']]], 
		schema: 'long-item',
		type: 'Item',
		config: {
			shift: true,
			media_width: 65
		},
		children: [
			{
				tag: 'div',
				key: 'long-item__content',
				classes: ['cols', 'gap-none'],
				children: [
					[{rule: {n: 'truthy'}, key: 'local.it.media'}, 'long-item__content__media'],
					{
						tag: 'div',
						key: 'long-item__content__elements',
						classes: ['col', [{rule: {n: 'truthy', not: true}, key: 'local.columnar'}, ['scroll-y']]],
						editable: true,
						css: {
							'max-height': {
								type: 'key',
								value: 'local.mboxh'
							}
						},
						children: [
							'li-author',
							'li-text'
						]
					}
				]
			}	
		]
	},
	'long-item__content__media': {
		tag: 'div',
		classes: ['col', 'flex-none'],
		ref: 'mediael',
		css: {
			width: {
				type: 'key',
				value: 'local.mboxw'
			},
		},
		children: [
			'li-media',
			'li-link-box'
		]
	}
};
