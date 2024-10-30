export default {
	'simple-viewer': {
		tag: 'div',
		component: 'SimpleViewer',
		name: 'Simple Viewer',
		type: 'Viewer',
		classes: ['mb-normal'],
		children: [
			[
				{rule: {n: 'equals', v: 1}, key: 'local.viewMode'}, 
				'simple-viewer__lightbox',
			],
			[
				{rule: {n: 'equals', v: 3}, key: 'local.viewMode'}, 
				'simple-viewer__inline__wrapper',
			]
		]
	},
	'simple-viewer__inline__wrapper': {
		tag: 'div',
		name: 'Inline',
		classes: ['relative'],
		hideable: false,
		children: [
			'simple-viewer__inline',
			'simple-viewer__navigation',
		]
	},
	'simple-viewer__inline': {
		tag: 'div',
		children: [
			[
				{rule: {n: 'truthy'}, key: 'local.isCollection'}, 
				'simple-viewer__collection',
				'simple-viewer__item'
			]
		]
	},
	'simple-viewer__lightbox': {
		tag: 'div',
		component: 'LightBox',
		name: 'Lightbox',
		hideable: false,
		slots: true,
		children: [
			'simple-viewer__ligthbox__inner',
			'simple-viewer__navigation'
		]
	},
	'simple-viewer__ligthbox__inner': {
		tag: 'div',
		classes: ['fullwidth', 'bg-shadea4'],
		children: [
			[
				{rule: {n: 'truthy'}, key: 'local.isCollection'}, 
				'simple-viewer__collection',
				'simple-viewer__item'
			]
		]
	},
	'simple-viewer__comments': {
		tag: 'div',
		component: 'Comments',
		classes: ['pa-sm']
	},
	'simple-viewer__collection': {
		tag: 'div',
		hideable: false,
		children: [
			{
				tag: 'div',
				key: 'simple-viewer__collection__thumbgrid',
				component: 'ThumbGrid'
			},
			[
				{rule: {n: 'truthy'}, key: 'local.showComments'},
				'simple-viewer__comments'
			]
		]
	},
	'simple-viewer__item': {
		tag: 'div',
		component: 'Item',
		hideable: false,
		name: 'Item',
		config: {
			shift: true,
			media_width: 65
		}
	},
	'simple-viewer__navigation': {
		tag: 'div',
		component: 'Navigation',
		name: 'Navigation',
		classes: ['carousel__navigation--static', 'carousel__navigation--static--in'],
		config: {
			classes: {
				button: {
					round: '',
					size: '',
					color: 'primary'
				}
			}
		},
		schema: 'carousel__navigation',
		eclasses: [
			['spacing', {mt: 'mt-sm'}],
			['alignment', {jc: 'jc-between'}]
		]
	}
};
