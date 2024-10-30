import {warn, getDeepProp, Fence, dc} from '../libs/bp';


const computerNotDefined = computer => {
	return (...args) => warn(`${computer} is not defined`, args);
};

const getPathValue = (elem, {type, value}) => {
	if( type === 'array' ){
		value = value.slice();
		const joinwith = value.shift();
		return value.map(a => {
			if( a instanceof Object )
				return getPathValue(elem, a);
			return a;
		}).join(joinwith);
	}
	else if( type === 'key' )
		return getDeepProp(elem, value);
	
	else if( type === 'compute' )
		return callComputer(elem, value, elem);
};

const stringOrPathValue = (elem, obj) => {
	return obj instanceof Object ? getPathValue(elem, obj) : obj;
};

const callComputer = (elem, computer, ...args) => {
	return (elem.local[computer] || computerNotDefined(computer))(...args);
};

const checkFence = (xuirule, elem) => {
	return Fence.process(
		xuirule.rule, 
		xuirule.key ? getDeepProp(elem, xuirule.key) : callComputer(elem, xuirule.compute, xuirule)
	);
};

const RenderHelpers = {
	props: {
		eid: {
			required: true
		},
		peid: {
			required: true
		},
		edata: {
			required: false,
			default: () => null
		}
	},
	
	inject: {
		getTypedComponent: {
			default: () => null
		}
	}
};

const eclasses = (e) => e.eclasses ? Object.values(e.eclasses).filter(Boolean) : [];

const expandValue = (list, e) => {
	return list.map(c => {
		if(Array.isArray(c)){
			return checkFence(c[0], e) ? c[1] : c[2];
		}
		return c;
	}).filter(Boolean);
};

const makeCSS = (rattrs, elem) => {
	let css = '';
	for(const attr in rattrs){
		const av = rattrs[attr];
		if(typeof av === 'object'){
			const df = getPathValue(elem, av);
			css += `${attr}: ${df};`;
		}
		else css += `${attr}: ${av};`;
	}
	return css;
};

const RendererMixin = {
	mixins: [RenderHelpers],
	
	inject: {
		Elements: {
			required: true,
		},
		
		isEditor: {
			type: Boolean,
			default: () => false
		},
		
		selectElementForEdit: {
			default: () => null
		}
	},
	
	methods: {
		getElement(id){
			return this.Elements[id];
		},
		
		createChildren(children, peid, data, i){
			if( !children ) return null;
			return expandValue(children, {local: this, data})
				.map((id) => this.createChild(id, peid, data, i));
		},
		
		createChild(id, peid, data, i){
			const c = this.getElement(id);
			if( !c ) console.error(id, peid);
			if( c.component ) return this.createComponent(c, peid, data, i);
			return this.createElement(c, peid, data, i);
		},
		
		createElement(options, peid, data, i){
			const {tag, props={}, classes=[], component, children, attrs={}, domAttrs={}, type=null, eid, text, ref=null, list, slots, key, on={}, vkey, css} = options;
			let childs = null;
									
			if( !component ){
				if( text ){
					childs = typeof text === 'object' ? getPathValue({local: this, data}, text) : text;
				} else {
					if( list ){
						const items = getPathValue({local: this, data}, list);
						childs = items.map((e, i) => this.createChild(children[0], peid, e, i));
						//props.appear = true;
						//props.name = this.cP('fade');
					} else {
						//if( key === 'sequence-item' ) console.log(options, peid, data.id, i);
						childs = this.createChildren(children, eid, data, i);
					}
				}
			}
			
			if( slots ){
				childs = this.createChildren(children, eid, data, i);
			}
			
			const cls = [...expandValue(classes, {local: this, data})];
			if( key ){
				cls.push(key);
			}
																		
			return this.$createElement(
				//list && childs ? 'transition-group' : tag, 
				tag, 
				{
					props, 
					class: this.cP([...cls, ...eclasses(options)]), 
					attrs, 
					domAttrs,
					style: css ? makeCSS(css, {local: this, data}) : null,
					//nativeOn: this.isEditor && type ? {click: (e) => this.selectElement(e, eid)} : null,
					on,
					ref,
					//key: Math.random() + +new Date
				}, 
				childs
			);
		},
				
		createComponent(c, peid, data, i){
			if( !this[c.component] ) return warn(`${c.component} creator method doesn't exist`);
			if( c.transition ){
				const {transition, ...rest} = c;
				return this.$createElement('transition', {props:{name: this.$CP('fade'), appear: true}}, [
					this[c.component](c, peid, data, i)
				]);
			}
			return this[c.component](c, peid, data, i);
		},
		
		createElementWithProps( e, props={}, peid, edata){
			return this.createElement({...e, tag: e.component, props: {eid: e.eid, peid, edata, ...props}}, peid);
		},
		
		generate(data){
			const elem = this.getElement(this.eid);
			if( !elem ) console.log(this.eid, {...this.$props});
			const {eid, tag, children, list, key} = elem;
			const classes = elem.classes ? [].concat(...expandValue(elem.classes.filter(e => Array.isArray(e)), {local: this, data})) : [];
			return this.createElement(elem.component ? {eid, tag, children, list, key, classes} : elem, this.peid, data);
		},
		
		selectElement(e, eid){
			e.stopPropagation();
			this.selectElementForEdit(eid);
		}
	},
	
	render(){
		return this.generate(this.edata);
	}
};

const postProcess = (Elements) => {
	const extractPossibleChildren = (e) => {
		const maybe = e.children.filter(c => Elements[c].component);
		if(maybe.length) return maybe;
		return [].concat(...e.children.map(c => {
			return Elements[c].children ? extractPossibleChildren(Elements[c]) : []
		}));
	};
	
	for(const [k, v] of Object.entries(Elements)){
		if(v.children) v.possible_children = extractPossibleChildren(v);
	}
	
	return Elements;
};

const SEPARATOR = '--oo--';

const normalizeElements = ({elements, root, shared={}}, local) => {
	const Elements = {};
	
	const fixElement = (c, key, i) => {
		if(!c.key) c.key = key;
		c.eid = key;
		Elements[key] = c;
		extractChildren(c, key);
		return key;
	};
	
	const extractChildren = (elem, p) => {
		if( elem.children ){
			elem.children = elem.children.map((c, i) => {
				if( Array.isArray(c) || !(c instanceof Object) ) return c;
				if(local) return fixElement(c, `${p}${ SEPARATOR }${c.key||i}`);
				else return fixElement(c, c.key);
			});
		}
	};
	
	for(const [key, val] of Object.entries(elements)){
		fixElement(val, key);
	}
	
	return {...Elements, ...shared};
	return postProcess({...Elements, ...shared});
};


export {RenderHelpers, RendererMixin, normalizeElements, expandValue};
