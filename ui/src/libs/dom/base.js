import {hsla, darken, invert} from './reusables/CSS';
import {getDeepProp} from '../bp';

const shades = [100, 98, 96, 86, 71, 48, 29, 21, 14, 7, 4];
const sizes = ['xs', 'sm', 'normal', 'md', 'l', 'xl', 'xxl', 'xxxl'];
const spacings = ['xs', 'sm', 'normal', 'md', 'l', 'xl'];

const seed = {
	colors: {
		primary: `hsl(171, 100%, 41%)`,
		//secondary: `hsl(271, 100%, 71%)`,
		secondary: `hsl(0, 0%, 18.4%)`,
		link: `hsl(217, 71%, 53%)`,
		success: `hsl(141, 71%, 48%)`,
		error: `hsl(348, 100%, 61%)`,
		warning: `hsl(14, 100%, 53%)`,
		hue: `hsl(0, 0%, 48%)`
	},
	card: {
		border: 0,
		elevation: 1,
		background: 1
	},
	rounded: 0,
	reverse_shades: 0
};

const designVariables = (seed) => {
	const Variables = {
		meta: {
			name: 'First'
		},
		colors: {
			primary: seed.colors.primary, //`hsl(171, 100%, 41%)`,
			secondary: seed.colors.secondary, //`hsl(271, 100%, 71%)`,
			link: seed.colors.link, //`hsl(217, 71%, 53%)`,
			success: seed.colors.success, //`hsl(141, 71%, 48%)`,
			error: seed.colors.error, //`hsl(348, 100%, 61%)`,
			warning: seed.colors.warning, //`hsl(14, 100%, 53%)`
		},
		tones: {
			shadea5: `hsl(0, 0%, 100%)`,
			shadea4: `hsl(0, 0%, 98%)`,
			shadea3: `hsl(0, 0%, 96%)`,
			shadea2: `hsl(0, 0%, 86%)`,
			shadea1: `hsl(0, 0%, 71%)`,
			hue: 	 `hsl(0, 0%, 48%)`,
			shadeb1: `hsl(0, 0%, 29%)`,
			shadeb2: `hsl(0, 0%, 21%)`,
			shadeb3: `hsl(0, 0%, 14%)`,
			shadeb4: `hsl(0, 0%, 7%)`,
			shadeb5: `hsl(0, 0%, 4%)`
		},
		sizes: {},
		spacing: {
			static: {},
			relative: {}
		},
		weights: {
			light: 300,
			normal: 400,
			semibold: 500,
			bold: 600
		},
		radii: {
			small: .125,
			normal: .25,
			large: .375,
			rounded: 20000
		},
		card: seed.card
	};

	const radii = seed.rounded;
	if( !radii ){
		for(const key in Variables.radii){
			Variables.radii[key] = 0;
		}
	}

	{
		const _shades = seed.reverse_shades ? shades.slice().reverse() : shades;
		const ssets = [
			['shadea', _shades.slice(0, 5).reverse()],
			['shadeb', _shades.slice(6)]
		];
		
		//const color = l => `hsl(0, 0%, ${l}%)`;
		
		const [h, s, l, a=1] = hsla(seed.colors.hue);
		const color = l => `hsla(${h}, ${s}%, ${l}%, ${a})`;
		
		for(const [name, values] of ssets){
			for(let i=5; i>0; i--)
				Variables.tones[`${name}${i}`] = color(values[i-1]);
		}
		
		Variables.tones.hue = color(shades[5]);
	}

	{
		const base = 1;
		const factors = [.25, .5, 1, 1.5, 2, 3];
		for(const [i, name] of spacings.entries()){
			Variables.spacing.static[name] = ['', base * factors[i], 'rem'];
			Variables.spacing.relative[name] = ['', base * factors[i], 'em'];
		}
	}

	{
		const base = 1;
		const factors = [.775, .875, 1, 1.25, 1.5, 1.75, 2, 2.5];
		for(const [i, name] of sizes.entries()){
			Variables.sizes[name] = ['', base * factors[i], 'em'];
		}
	}


	const parseKeys = obj => {
		for(const [k, v] of Object.entries(obj)){
			if( typeof v === 'object' ) obj[k] = parseKeys(v);
			else if( v.startsWith('Variables.') ){
				obj[k] = getDeepProp(Variables, v.replace('Variables.', ''));
				if( k.includes('invert') ) obj[k] = invert( obj[k] );
			}
		}
		return obj;
	};

	Object.assign(Variables, parseKeys({
		background: 'Variables.tones.shadea3',
		border: {
			color: 'Variables.tones.shadea2',
			hover: 'Variables.tones.shadea1'
		},
		text: {
			color: 'Variables.tones.shadeb1',
			light: 'Variables.tones.hue',
			strong: 'Variables.tones.shadeb3'
		},
		link: {
			color: 'Variables.colors.link',
			invert: 'Variables.colors.link',
			visited: `hsl(271, 100%, 71%)`,
			hover: 'Variables.tones.shadeb2',
			hover_border: 'Variables.tones.shadea1',
			focus: 'Variables.tones.shadeb2',
			focus_border: 'Variables.colors.link',
			active: 'Variables.tones.shadeb2',
			active_border: 'Variables.tones.shadeb1'
		},
		family: {
			primary: 'BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
			secondary: 'BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif'
		}
	}));
	
	return Variables;
};
	
export {seed as Variables, designVariables};
