export default {
	elements: {
		'pane': {
			tag: null,
			component: 'Pane',
			type: 'Pane'
		},
		'stream-editor': {
			tag: 'div', 
			name: 'Stream Editor', 
			component: 'StreamEditor'
		},
		'simple-pane': {
			tag: 'div',
			component: 'SimplePane',
			children: [
				'stream-editor',
				'pane-intro',
				'list',
				'pane'
			],
			type: 'Pane'
		},
		'pane-intro': {
			tag: 'div',
			component: 'PaneIntro',
			children: []
		},
		'plain-pane': {
			tag: 'div',
			component: 'Pane'
		},
		'list': {
			tag: null,
			component: 'List',
			type: 'List'
		},
		'viewer': {
			tag: null, 
			component: 'Viewer',
			//transition: true,
			type: 'Viewer'
		},
		'simple-light-list': {
			tag: 'div',
			component: 'SimpleLightList',
			classes: ['mb-normal'],
			children: [
				'list-meta'
			]
		},
		'list-meta': {
			tag: null,
			component: 'Meta',
			type: 'Meta'
		},
		'simple-meta': {
			tag: 'div',
			component: 'SimpleMeta',
			name: 'Simple Meta',
			type: 'Meta'
		},
		'masonry':{
			tag: 'div',
			name: 'Masonry',
			component: 'Masonry',
			children: [
				'viewer',
				{
					tag: 'div', 
					key: 'masonry__container', 
					classes: ['cols'],
					children: [
						'masonry__items__container'
					]
				}
			],
			type: 'List',
			eclasses: [
				'spacing'
			]
		},
		'masonry__items__container': {
			tag: 'div', 
			key: 'masonry__items__container', 
			classes: ['col', 'col-12'],
			editable: true,
			children: [
				'masonry__items',
				'list-pagination'
			]
		},
		'masonry__items': {
			tag: 'div', 
			key: 'masonry__items', 
			component: 'ListItems', 
			schema: 'masonry__items',
			name: 'Masonry Columns',
			config: {
				'min_width': ['', 300, 'px'],
				'max_width': ['', 420, 'px']
			},
			children: [
				{
					tag: 'div',
					classes: ['cols'],
					key: 'masonry__groups',
					name: 'Items',
					list: {
						type: 'key',
						value: 'local.buckets'
					},
					children: [
						{
							tag: 'div', 
							key: 'masonry__item', 
							classes: ['col'], 
							children: ['list-item'], 
							list: {
								type: 'key', 
								value: 'data'
							}
						}
					],
					eclasses: [
						'gap'
					]
				}
			]
		},
		'simple-list':{
			tag: 'div',
			name: 'Simple List',
			component: 'SimpleList',
			type: 'List',
			children: [
				'viewer',
				{
					tag: 'div', 
					key: 'simple-list__container', 
					classes: ['cols'],
					children: [
						'simple-list__items__container'
					],
					eclasses: [
						'gap'
					]
				}
			]
		},
		'simple-list__items__container': {
			tag: 'div', 
			key: 'simple-list__items__container', 
			classes: ['col', 'col-12'],
			children: [
				{
					tag: 'div', 
					key: 'simple-list__items', 
					component: 'ListItems',
					name: 'Items',
					list: {
						type: 'key',
						value: 'local.Items'
					},
					children: ['list-item'],
					eclasses: ['gap']
				},
				'list-pagination'
			]
		},
		'simple-list__meta': {
			tag: 'div',
			key: 'simple-list__meta',
			children: ['list-meta'],
			classes: ['col', 'col-12']
		},
		'list-pagination': {
			tag: 'div', 
			name: 'Pagination', 
			component: 'Pagination',
			eclasses: [
				['spacing', {mt: 'mt-md'}],
				['alignment', {jc: 'jc-center'}],
				{
					width: 'wide'
				}
			],
			eschema: {
				classes: {
					width: {
						name: 'Width',
						options: [['wide', 'Wide'], ['narrow', 'Narrow']]
					}
				}
			}
		},
		'list-item': {
			tag: null,
			component: 'Item', 
			type: 'Item' 
		}
	},
	root: 'root',
	shared: {}
};
