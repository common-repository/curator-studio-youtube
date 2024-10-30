import {getDeepProp, dc} from '../../bp';
import Domu from '../domu';

const clamp = (v, min=0, max=100) => Math.max(Math.min(v, max), min);

const hsla = color => color.split('(')[1].split(')')[0].split(',').map(c => parseFloat(c));
const rgba = hsla;

const darken = (color, percent=0) => {
	const [h, s, l, a=1] = hsla(color);
	return `hsla(${h}, ${s}%, ${ clamp(l-percent) }%, ${a})`;
}; 

const invert = color => {
	const [h, s, l, a=1] = hsla(color);
	if( l > 75 ) return 'hsla(0, 0%, 0%, .75)';
	return 'hsla(0, 0%, 95%, .95)';
};

const withAlpha = (color, alpha) => {
	const [h, s, l, a=1] = hsla(color);
	return `hsla(${h}, ${s}%, ${ l }%, ${alpha})`;
};

//https://gist.github.com/mjackson/5311256
function rgbaToHsla(r, g, b, a=1) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l, a ];
}

const Port = (() => {
	const points = {
		xs: 0,
		sm: 576,
		md: 768,
		l: 992,
		xl: 1200,
		xxl: 1472
	};
	
	return {
		names: Object.keys(points),
		points
	};
})();


const parseCSS = (selector, rattrs, data, Variables) => {
	let css = '', css2 = '';
	for(let attr in rattrs){
		const av = rattrs[attr];
		if(typeof av === 'object'){
			if(av.key){
				css += `${attr}: ${av.key.startsWith('Variables.') ? getDeepProp(Variables, av.key.replace('Variables.', '')) : data[av.key]};`;
			} else {
				console.error('Array selectors is not implemented here');
				for(const [at, {props}] of Object.entries(av)){
					css2 += parseCSS( `.${at} ${selector}`, props, data, Variables );
				}
			}
		} else {
			css += `${attr}: ${av};`;
		}
	}
	return `${selector}{ ${css} }` + css2;
};

const compile = (selector, {meta, props}, data, Styles, Variables, class_prefix) => {
	selector += meta.state;
	let css = parseCSS( selector, props, data, Variables );
	if( meta.include ) {
		for(const [sel, style, datai=data] of meta.include){
			let cur_sel;
			if( Array.isArray(sel) ){
				cur_sel = sel.map(s => selector + s.replace(/\../g, class_prefix)).join(',');
			} else {
				cur_sel = selector + sel.replace(/\../g, class_prefix);
			}
			
			//console.log(selector);
			
			css += compile(
				//selector + sel.replace(/\../g, class_prefix),
				cur_sel,
				typeof style === 'string' ? Styles[style] : {meta:{state:''}, props:style}, 
				datai, 
				Styles, 
				Variables, 
				class_prefix
			);
		}
		//if( selector.includes('column') ) console.log(css);
	}
	return css;
};

const makeCSS = (classes, Styles, prefix, Variables, class_prefix) => {
	let css = '';
	for(const name of classes){
		css += compile(prefix+name, Styles[name], null, Styles, Variables, class_prefix);
	}
	return css;
};

const fixStyleProps = (Styles, is_class=false) => {
	for(let [name, style] of Object.entries(Styles)){
		if( !style.props ){
			style = (Styles[name] = {props: style});
		}
		if( !style.meta ) style.meta = {state: ''};
		if(!style.meta.name) style.meta.name = name;
		if(!style.meta.id) style.meta.id = name;
		style.meta.is_class = is_class;
	}
	return Styles;
};

const indexStyles = (Roots, Styles) => {
	function concat({meta={}}, roots){
		const sels = [];
		if(meta.include){
			for(const [sel, s] of meta.include){
				if(typeof s === 'string'){
					sels.push( ...concat(Styles[s], roots.map(r => r+sel)) );
				} else {
					sels.push( ...roots.map(r => r+sel) );
				}
			}
		}
		return sels;
	}
	
	const Modifiers = {};
	const List = [];
	
	for(const [k, v] of Object.entries(Roots)){
		Modifiers[k] = new Set();
		const re = concat(v, ['']);
		for(let r of re){
			r = r.replace(/\[.*]|\(|\)/g, '').split(/>| |:|\+|~/);
			r[0].split('..').slice(1).forEach(c => Modifiers[k].add(c));
			for( const c of r.slice(1).filter(Boolean).map(c => c.split('..'))){
				List.push(...c.slice(1));
			}
		}
		List.push(k, ...Modifiers[k]);
	}
	
	return {Modifiers, List: new Set(List)};
};


const mergeAutoColors = (Variables) => {
	const colors = {primary: 'auto', hue: 'auto', link: 'auto'};
	return {...Variables, colors: {...Variables.colors, ...colors}};
};

const hslaString = ([h, s, l, a=1]) => {
	return `hsla(${h*360}, ${s*100}%, ${l*100}%, ${a})`;
};

const mergeAutoVariables = (vars, wrapper) => {
	const colors = {...Domu.getDefaultColors(wrapper)};
	colors.link = hslaString(rgbaToHsla( ...rgba(colors.link) ));
	colors.primary = colors.link;
	colors.hue = hslaString(rgbaToHsla( ...rgba(colors.text) ));
	
	vars = dc(vars);
	for(const k in vars.colors){
		if( vars.colors[k] === 'auto' ){
			vars.colors[k] = colors[k];
		}
	}
	
	//vars.reverse_shades = 1;
	//vars.rounded = 0;
	
	return vars;
};


export {hsla, rgba, darken, invert, withAlpha, compile, makeCSS, fixStyleProps, Port, indexStyles, rgbaToHsla, mergeAutoVariables, mergeAutoColors};
