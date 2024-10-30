import {uuid, dc} from '../../../libs/bp';
import {normalizeElements} from '../../elements';

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const claschemaGroup = (text, children=[], {fields=[], title=[]}={}) => {
	return {
		tag: 'div',
		classes: ['sed-group'],
		children: [
			{
				tag: 'h3',
				classes: title,
				text
			},
			{
				tag: 'div',
				classes: fields,
				children
			}
		]
	};
};

const classSelector = (k, v) => {
	return {
		tag: 'SelectInput',
		component: 'Input',
		classes: ['sed-field'],
		config: {
			path: k,
			label: v.name,
			config: {
				allow_empty: true,
				select_key: 'value',
				multiple: false
			},
			options: v.options.map(([value, label]) => ({label, value}))
		}
	};
};

const directionalProperties = (prop) => {
	return [['t', 'Top'], ['r', 'Right'], ['b', 'Bottom'], ['l', 'Left'], ['a', 'All']].map(([dir, name]) => {
		return {
			tag: 'div',
			classes: ['halfwidth'],
			children: [
				classSelector(`${prop}${dir}`, {
					name,
					options: [
						['', 'Auto'],
						...[['xs', 'XS'], ['sm', 'SM'], ['normal', 'Normal'], ['md', 'M'], ['l', 'L'], ['none', 'None']].map(([a, b]) => [`${prop}${dir}-${a}`, b])
					]
				})
			]
		};
	})
};

const cloneElements = Elements => {
	const elements = {};
	for(const [k, v] of Object.entries( Elements ) ){
		const {schema, eschema, editable, ...rest} = v;
		elements[k] = dc(rest);
	}
	return elements;
};

/*

{
	eclasses: [
		string key, // presets aka builtins
		[key, {...defaults}], // presets aka builtins
		{
			[key]: class	// inline [Can be only one object]
		}
	],
	eschema: {
		classes: {
			
		}
	}
}
	

*/

const norm = (e, Schema) => {
	let builtins = [], inline = {}, echildren = [];
	if(e.eclasses){
		builtins = e.eclasses.filter(e => typeof e === 'string' || Array.isArray(e));
		inline = e.eclasses.filter(e => !(typeof e === 'string' || Array.isArray(e)))[0] || {};
	}
	
	e.eclasses = builtins.reduce((acc, cur) => Array.isArray(cur) ? Object.assign(acc, cur[1]) : acc, inline);
	
	if( e.eschema && e.eschema.classes ){
		for(const [k, v] of Object.entries( e.eschema.classes ) ){
			if( inline[k] === undefined ) v.options.unshift(['', 'Auto']);
			e.eschema.classes[k] = classSelector(k, v);
		}
		echildren = Object.values(e.eschema.classes);
	}
	
	Schema.elements[`${e.key}-eschema`] = {
		tag: 'div',
		children: [
			...echildren,
			...builtins.map(e => Array.isArray(e) ? e[0] : e)
		]
	};
	
	e.eschema = `${e.key}-eschema`;
};


const normalizeStoredElements = (Elements, Schema) => {
	Elements = normalizeElements(Elements);
	for(const [k, v] of Object.entries( Elements ) ){
		if( v.eclasses || (v.eschema && v.eschema.classes) ){
			norm(v, Schema);
		}
	}
	return Elements;
};

const mergeNormalizedElements = (main, partials) => {
	//return main;
	for(const k in partials){
		if( !main[k] ) console.error(k, ' : Main element font found to merge partial');
		Object.assign(main[k], partials[k]);
	}
	return main;
};

export {claschemaGroup, directionalProperties, cloneElements, classSelector, normalizeStoredElements, mergeNormalizedElements};
