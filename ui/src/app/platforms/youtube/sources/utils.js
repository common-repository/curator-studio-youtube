import Config from '../config';

const createSource = edge => {
	return {static: false, source: 'youtube', edge, entity: '', limit: Config.source.limit.any, exclude: null};
};

const createSearchSource = edge => {
	return {...createSource(edge), from: null, to: null, channel: '', sortby: 'date'};
};

const Fields = {
	entity({label, tip=null, masks=null}, edge){
		return [
			{
				tag: 'EntityInput',
				component: 'Input',
				classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
				config: {
					path: 'entity',
					type: 'text',
					label,
					tip: edge.includes('--') ? {
						content: 'Please see <a href="https://curatorstudio.io/docs/dynamic-entities/" target="_blank">this article</a>'
					} : tip,
					masks,
					validations: edge.includes('search') && !edge.includes('--') ? [] : [{n:'onlyspace', not: true, msg:'Cannot be empty'}]
				}
			}
		];
	},
	static: [
		{
			tag: 'SwitchInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none', 'flex-column'],
			config: {
				path: 'static',
				label: 'Pinned',
				tip: 'Items from pinned source will always show before others',
				options: [
					{value: false, label: ''},
					{value: true, label: ''}
				]
			}
		}
	],
	limit(schema){
		return [
			{
				tag: 'TextInput',
				component: 'Input',
				classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
				config: {
					path: 'limit',
					label: 'Limit (API)',
					type: 'number',
					tip: 'How many items to fetch from this source\'s API at a time',
					attrs: {
						min: 1,
						max: Config.source.limit.any
					},
					validations:[
						{n: 'min', v:1, msg: 'Must be at least 1'},
						{n: 'max', v:Config.source.limit.any, msg: `Cannot be more than ${Config.source.limit.any}`}
					]
				}
			}
		];
	},
	date_range: [	
		{
			tag: 'DateInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
			config: {
				path: 'from',
				label: 'From',
				type: 'date',
				validations: []
			}
		},
		{
			tag: 'DateInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
			config: {
				path: 'to',
				label: 'To',
				type: 'date',
				validations: []
			}
		}
	],
	channel: [
		{
			tag: 'EntityInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
			config: {
				path: 'channel',
				type: 'text',
				label: 'Channel',
				tip: 'Restrict search to this channel id or URL',
				masks: ['channel'],
				validations: []
			}
		}
	],
	country_code: [
		{
			tag: 'EntityInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'mb-sm', 'col', 'flex-none'],
			config: {
				path: 'region_code',
				type: 'text',
				label: '2-letter country code',
				tip: 'Restrict category videos to this country',
				validations: []
			}
		}
	],
	sort: [
		{
			tag: 'SelectInput',
			component: 'Input',
			classes: ['col'],
			config: {
				path: `sortby`,
				label: 'Sort by (API)',
				config: {
					allow_empty: false,
					select_key: 'value',
					multiple: false
				},
				options: [
					{value: 'date', label: 'Date'}, 
					{value: 'relevance', label: 'Relevance'},
					{value: 'viewCount', label: 'Views'},
					{value: 'rating', label: 'Likes'},
					{value: 'title', label: 'Title'}
				]
			}
		}
	],
	exclude: [
		{
			tag: 'TextInput',
			component: 'Input',
			classes: ['d-flex', 'ai-center', 'col', 'flex-none'],
			config: {
				path: 'exclude',
				label: 'Exclude words',
				type: 'text',
				tip: 'Exclude items containing these words. Separate multiple words by commas.'
			}
		}
	]
};

const expansions = (e, extras) => {
	return extras.map(x => [`${e}${x[0]}`, x.slice(1)]);
};

const getFields = (fields, edge) => {
	return fields.map(f => {
		return typeof Fields[f] === 'function' ? Fields[f](edge) : Fields[f];
	});
};

const expandPaths = (paths, extras) => {
	const ps = [];
	for(const p of paths){
		const {title, fields, schema, ...rest} = p;
		const e = fields.edge;
				
		for(const [edge, [suffix, label]] of [[e, ['', schema.label]], ...expansions(e, extras)]){
			const schema_fields = schema.fields || [[]];
			ps.push(
				{
					title: title + suffix,
					fields: {
						...fields,
						edge
					},
					...rest,
					schema: [
						Fields.entity({...schema, label}, edge).concat(
							...getFields(schema_fields[0], {...fields, edge})
						),
						...( schema_fields[1] ? [[].concat(...getFields(schema_fields[1], {...fields, edge}))] : [] )
					]
				}
			);
		}
	}
	return ps;
};

export {expandPaths, createSource, createSearchSource};
