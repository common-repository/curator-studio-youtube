import Vue from 'vue';
import md5 from './md5';

const rand = (min=0, max=1) => min + Math.random()*(max-min);
const range = (start, end, step=1) => Array(end-start).fill(start).map((a, b) => a+b*step);

const uuid = () => {
	return `U-${(Math.random() + Math.random()).toString().substr(2)}`;
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
};

const getDeepProp = (obj, key) => {
	//if( !key ) return warn('No deep key to access', obj) && undefined;
	//if( !obj ) return warn('No object to access deep key', obj, key) && undefined;
	return getSimpleDeepProp(obj, key);
};

const getSimpleDeepProp = (obj, key) => {
	//console.log(obj, key);
	for(const k of key.split('.')){
		obj = obj[k];
		if( obj === undefined ) break;
	}
	return obj;
};

const omit = (obj, fields) => {
	const shallowCopy = {
		...obj,
	};
	
	for (let i = 0; i < fields.length; i++) {
		const key = fields[i];
		delete shallowCopy[key];
	}
	return shallowCopy;
};

const dc = o => o ? JSON.parse(JSON.stringify(o)) : o;
//const dc = copy;

const setDeepProp = (obj, key, value) => {
	if( !obj ) console.error('Only Key: ', key);
	if( !key ) return false;
	for(let k of key.split('.').slice(0, -1)){
		if( typeof obj[k] !== 'object' ) obj[k] = {}; 
		//if( typeof obj[k] !== 'object' ) Vue.set(obj, k, {}); 
		obj = obj[k];
		//if( typeof obj !== 'object' ) break;
	}
	//if( typeof obj === 'object' ) return (obj[key.split('.').splice(-1)[0]] = value);
	if( typeof obj === 'object' ) return (Vue.set(obj, key.split('.').splice(-1)[0], value));
	return false;
};

const deleteDeepProp = (obj, key) => {
	if( !obj ) console.error('Only Key: ', key);
	if( !key ) return false;
	for(let k of key.split('.').slice(0, -1)){
		obj = obj[k];
		if( typeof obj !== 'object' ) break;
	}
	if( typeof obj === 'object' ) return delete obj[key.split('.').splice(-1)[0]];
	return false;
};

const applyFilters = (e, filters) => {
	return filters.every((f, j) => {
		if(Array.isArray(f)) return applyFilters(e, f);
		if(!f.key) return true;
		
		if( !f.type || f.type === 'match' ){
			if(Array.isArray(f.selected)) return f.selected.includes(e[f.key]+'');
			else return f.selected == e[f.key];
		} else if( f.type === 'range' ) {
			return e[f.key] >= f.from && e[f.key] <= f.to;
		}
	});
};

const filter = (a, filters=[]) => {
	filters = filters.filter(f => (Array.isArray(f) && f.length) || f.key);
	if(!filters.length) return a.slice();
	
	return a.filter((e, i) => {
		return applyFilters(e, filters);
	});
};

		
const Fence = {
	minLength: (val, l) => l <= val.length,
	maxLength: (val, l) => l >= val.length,
	min: (val, v) => !isNaN(val) && v <= Number(val),
	max: (val, v) => !isNaN(val) && v >= Number(val),
	empty: (val) => !val,
	truthy: (val) => !!val,
	equals: (val, v) => val === v,
	contains: (val, v) => v.includes(val),
	startsWith: (val, v) => val.startsWith(v),
	onlyspace: (val) => !val.trim(),
	
	process(rule, val){
		const bool = this[ rule.n ](val, rule.v);
		return rule.not ? !bool : bool;
	}
};

const removeFromArray = (array, item, mutate=true) => {
	const idx = array.indexOf(item);
	if(idx > -1){
		if(!mutate)array = array.slice();
		array.splice(idx, 1);
		return array;
	}
};

const warn = (...msgs) => {
	console.error(...msgs);
	return undefined;
};

const groupBy = (arr, key) => {
	return arr.reduce((g, e) => {
		(g[e[key]] || (g[e[key]]=[])).push(e);
		return g;
	}, Object.create(null));
};

const inverseObject = obj => Object.entries( obj ).reduce((acc, [k, v]) => Object.assign(acc, {[v]: k}), {});

const hashObject = (obj) => {
	return md5(
		JSON.stringify(
			Object.entries(obj)
				.sort((a, b) => a>b?1:-1)
				.reduce((acc, [k, v]) => Object.assign(acc, {[k]: v}), {})
		)
	);
};

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

export {
	rand,
	getDeepProp, 
	getSimpleDeepProp, 
	uuid, 
	dc, 
	deleteDeepProp, 
	setDeepProp, 
	removeFromArray,
	range,
	warn,
	Fence,
	filter,
	groupBy,
	inverseObject,
	hashObject,
	capitalize,
	omit
};
