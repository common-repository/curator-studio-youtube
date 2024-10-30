export default {
	'summary-shell': {
		tag: null,
		component: 'Meta',
		type: 'Meta',
		components: {
			Meta: 'summary'
		}
	},
	'summary': {
		tag: 'div',
		component: 'Summary',
		name: 'Summary',
		components: {
			Summary: 'summary__sources-summary'
		},
		type: 'Meta',
		children: [
			{
				tag: 'div',
				key: 'summary__wrapper',
				editable: true,
				children: [
					'summary__bio',
					{
						tag: 'div',
						key: 'summary__write-review__wrapper',
						classes: ['mt-normal', 'mb-normal'],
						children: ['summary__write-review'],
						name: 'Write Review',
						eclasses: [
							'spacing'
						]
					},
					'summary__summary',
					{
						tag: 'div',
						key: 'summary__source-badges__wrapper',
						classes: ['mt-normal'],
						children: ['summary__source-badges'],
						name: 'Badges'
					}
				]
			}
		]
	},
	'summary-2': {
		tag: 'div',
		component: 'Summary',
		name: 'Summary 2',
		components: {
			Summary: 'summary__sources-summary'
		},
		type: 'Meta',
		children: [
			{
				tag: 'div',
				key: 'summary-2__wrapper',
				editable: true,
				classes: ['ba-1'],
				children: [
					'summary__bio',
					'summary__summary'
				]
			}
		]
	},
	'summary__summary': {
		tag: null,
		type: 'Summary',
		component: 'Summary'
	},
	'summary__bio': {
		tag: 'div',
		component: 'Bio',
		name: 'Bio'
	},
	'summary__write-review': {
		tag: 'div',
		component: 'WriteReview'
	},
	'summary__sources-summary': {
		tag: 'div',
		type: 'Summary',
		component: 'SourcesSummary',
		name: 'Summary'
	},
	'summary__source-tabs': {
		tag: 'div',
		type: 'Summary',
		component: 'SourceTabs',
		name: 'Tabs'
	},
	'summary__source-badges': {
		tag: 'div',
		component: 'SourceBadges'
	}
};
