import {claschemaGroup, directionalProperties, classSelector} from './utils';

const schemaGroup = claschemaGroup;
const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const streamOptions = (comments=false) => {
	const c = comments ? 'comments.' : '';
	const inputs = [
		{
			tag: 'div',
			classes: 'box pa-none bra-sm clipped'.split(' '),
			children: [
				{
					tag: 'div',
					classes: 'pa-sm pl-normal pr-normal bg-shadea3 tw-semibold h6 color-shadeb3 d-flex jc-between ai-center'.split(' '),
					text: 'Pagination'
				},
				{
					tag: 'div',
					classes: ['pa-normal'],
					children: [
						{
							tag: 'div',
							classes: ['cols'],
							children: [
								{
									tag: 'TextInput',
									component: 'Input',
									classes: ['col'],
									config: {
										path: `${c}list.pagination.per_page`,
										type: 'number',
										label: 'Per page',
										attrs: {
											min: 0
										},
										validations:[
											{n: 'min', v:0, msg: 'Must be at least 0'}
										]
									}
								},
								{
									tag: 'TextInput',
									component: 'Input',
									classes: ['col'],
									config: {
										path: `${c}list.pagination.max_results`,
										type: 'number',
										label: 'Total limit',
										tip: 'Enter 0 for no limit',
										attrs: {
											min: 0
										},
										validations:[
											{n: 'min', v:0, msg: 'Must be at least 0'}
										]
									}
								},
								{
									tag: 'SelectInput',
									component: 'Input',
									classes: ['col'],
									config: {
										path: `${c}list.pagination.type`,
										label: 'Style',
										config: {
											allow_empty: false,
											select_key: 'value',
											multiple: false
										},
										type: 'number',
										options: [
											{value: 2, label: 'Load more button (items replaced)'}, 
											{value: 4, label: 'Load more button (items appended)'},
											{value: 3, label: 'Prev / Next buttons'}
										]
									}
								}
							]
						}
					]
					
				}
			]
		}
	];
	return inputs;
};


const Schema = {
	elements: {
		'esm-theme': {
			tag: 'div',
			classes: ['h5'],
			children: [
				{
					tag: 'ColorInput',
					component: 'Input',
					classes: ['mb-sm'],
					config: {
						path: 'colors.primary',
						type: 'color',
						label: 'Primary',
						autoable: true,
						validations:[]
					}
				},
				{
					tag: 'ColorInput',
					component: 'Input',
					classes: ['mb-sm'],
					config: {
						path: 'colors.secondary',
						type: 'color',
						label: 'Secondary',
						validations:[]
					}
				},
				{
					tag: 'ColorInput',
					component: 'Input',
					classes: ['mb-sm'],
					config: {
						path: 'colors.link',
						type: 'color',
						label: 'link',
						autoable: true,
						validations:[]
					}
				},
				{
					tag: 'ColorInput',
					component: 'Input',
					classes: ['mb-normal'],
					config: {
						path: 'colors.hue',
						type: 'color',
						label: 'Text',
						autoable: true,
						validations:[]
					}
				},
				/*{
					tag: 'SelectInput',
					component: 'Input',
					classes: ['mb-normal'],
					config: {
						path: 'reverse_shades',
						label: 'Scheme',
						config: {
							allow_empty: false,
							select_key: 'value',
							multiple: false
						},
						type: 'number',
						options: [
							{value: 0, label: 'Light'}, 
							{value: 1, label: 'Dark'}
						]
					}
				},*/
				schemaGroup('Card', [
					{
						tag: 'SwitchInput',
						component: 'Input',
						classes: ['d-flex', 'ai-center', 'mb-sm'],
						config: {
							path: 'card.background',
							label: 'Background',
							options: [
								{value: 0, label: ''},
								{value: 1, label: ''}
							]
						}
					},
					{
						tag: 'SwitchInput',
						component: 'Input',
						classes: ['d-flex', 'ai-center', 'mb-sm'],
						config: {
							path: 'card.elevation',
							label: 'Shadow',
							options: [
								{value: 0, label: ''},
								{value: 1, label: ''}
							]
						}
					},
					{
						tag: 'SwitchInput',
						component: 'Input',
						classes: ['d-flex', 'ai-center', 'mb-sm'],
						config: {
							path: 'card.border',
							label: 'Border',
							options: [
								{value: 0, label: ''},
								{value: 1, label: ''}
							]
						}
					},
					{
						tag: 'SwitchInput',
						component: 'Input',
						classes: ['d-flex', 'ai-center', 'mb-sm'],
						config: {
							path: 'rounded',
							label: 'Rounded Corners',
							options: [
								{value: 0, label: ''},
								{value: 1, label: ''}
							]
						}
					}
				],
				{
					title: ['h5']
				}
				)
			] 
		},
		
		'esm-stream-pagination': {
			tag: 'div',
			children: streamOptions()
		},
		
		'esm-stream': {
			tag: 'div',
			classes: ['has-inline-inputs'],
			children: [
				[{rule: {n: 'truthy'}, key: 'local.conditionals.pagination'}, 'esm-stream-pagination'],				
				{
					tag: 'div',
					classes: 'box pa-none bra-sm clipped mt-normal'.split(' '),
					children: [
						{
							tag: 'div',
							classes: 'pa-sm pl-normal pr-normal bg-shadea3 tw-semibold h6 color-shadeb3 d-flex jc-between ai-center'.split(' '),
							text: 'Items'
						},
						{
							tag: 'div',
							classes: ['cols', 'pa-normal'],
							children: [
								{
									tag: 'SelectInput',
									component: 'Input',
									classes: ['col'],
									config: {
										path: 'list.viewer.mode',
										label: 'On Item Click',
										config: {
											allow_empty: false,
											select_key: 'value',
											multiple: false
										},
										type: 'number',
										options: [
											{value: 1, label: 'Open in lightbox'}, 
											{value: 2, label: 'Redirect'},
											{value: 3, label: 'Open before/after list'}
										]
									}
								}
							]
						}
					]
				}
			]
		}
	},
	root: 'schema',
	shared: {}
};

const Claschemas = {
	spacing: claschemaGroup('Spacing', [
		claschemaGroup('Margin', directionalProperties('m'), {title: ['h5'], fields: ['d-flex', 'flex-wrap']}),
		claschemaGroup('Padding', directionalProperties('p'), {title: ['h5'], fields: ['d-flex', 'flex-wrap']})
	], {title: ['h4', 'mb-xs']}),
	borders: claschemaGroup('Borders', [
		...[['t', 'Top'], ['r', 'Right'], ['b', 'Bottom'], ['l', 'Left'], ['a', 'All']].map(([dir, name]) => {
			return {
				tag: 'div',
				classes: ['halfwidth'],
				children: [
					classSelector(`b${dir}`, {
						name,
						options: [
							['', 'Auto'],
							...[['1', '1px'], ['none', 'None']].map(([a, b]) => [`b${dir}-${a}`, b])
						]
					})
				]
			};
		})
	], {title: ['h4', 'mb-xs'], fields: ['d-flex', 'flex-wrap']}),
	alignment: claschemaGroup('Alignment', [
		classSelector('jc', {
			name: 'Align',
			options: [
				['', 'Auto'],
				...['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].map(cur => {
					const label = cur.split('-')[1] || cur;
					return [`jc-${label}`, capitalize(label)];
				})
			]
		})
	], {title: ['h4', 'mb-xs']}),
	gap: classSelector('gap', {
		name: 'Gap',
		options: [['', 'Auto'], ...['xs', 'sm', 'normal', 'md', 'none'].map(e => [`gap-${e}`, e.toUpperCase()])]
	})
};

export {Schema, Claschemas, streamOptions};
