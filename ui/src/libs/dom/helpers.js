import {makeCSS, fixStyleProps, Port, indexStyles, withAlpha} from './reusables/CSS';

const getContainerClasses = () => {
	const {l, xl, xxl} = Port.points, gap = 32;
	const Styles = {
		l:{
			meta: {
				state:'',
				include: [
					[
						` ..container`,
						{'max-width': `${ l - (2 * gap) }px`, 'width': `${ l - (2 * gap) }px`}
					],
					[
						` ..container..is-fluid`,
						{'margin-left': `${gap}px`, 'margin-right': `${gap}px`, 'max-width': 'none', 'width': 'auto'}
					]
				]
			},
			props: {}
		},
		xl:{
			meta: {
				state:'',
				include: [
					[
						` ..container`,
						{'max-width': `${ xl - (2 * gap) }px`, 'width': `${ xl - (2 * gap) }px`}
					],
					[
						` ..container..is-fluid`,
						{'margin-left': `${gap}px`, 'margin-right': `${gap}px`, 'max-width': 'none', 'width': 'auto'}
					]
				]
			},
			props: {}
		},
		/*xxl:{
			meta: {
				state:'',
				include: [
					[
						` ..container`,
						{'max-width': `${ xxl - (2 * gap) }px`, 'width': `${ xxl - (2 * gap) }px`}
					],
					[
						` ..container..is-fluid`,
						{'margin-left': `${gap}px`, 'margin-right': `${gap}px`, 'max-width': 'none', 'width': 'auto'}
					]
				]
			},
			props: {}
		}*/
	};
	return fixStyleProps(Styles, true);
};

const getSectionClasses = () => {
	const Styles = {
		section: {
			padding: '3rem 1.5rem'
		},
		l: {
			meta: {
				state: '',
				include: [
					[` ..section..is-medium`, {padding: '9rem 1.5rem'}],
					[` ..section..is-large`, {padding: '18rem 1.5rem'}]
				]
			},
			props: {}
		}
	};
	return fixStyleProps(Styles, true);
};

/*
		${t}{ 
			background-color: ${Variables.background};
			color: ${Variables.text.color};
			font-family: ${Variables.family.primary};
			font-weight: ${Variables.weights.normal};
			line-height: 1.5;
		}
		
		${t} a:hover{
			color: ${Variables.link.hover};
		}

		${t} button, ${t} input, ${t} select, ${t} textarea{
			color: inherit;
			font-family: ${Variables.family.primary};
			font-weight: inherit;
			border:none;
			outline:none;
		}

*/

const getBaseStyles = (t, Variables, cp, id) => {
	return `
		${t}{ 
			color: ${Variables.text.color};
			line-height: 1.5;
			box-sizing: border-box;
		}
		${t} *, ${t} *::before, ${t} *::after {
		  box-sizing: inherit;
		}
		${t} ${cp}xs{ 
			font-size: .9em;
		}
		${t} ${cp}sm{ 
			font-size: 1em;
		}
		@media(max-width:576px){
			${t} ${cp}xs{ 
				font-size: inherit;
			}
		}
		${['figure'].map(e => `${t} ${e}`).join(', ')}{
			display:block;
		}
		${['figure', 'p', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe'].map(e => `${t} ${e}`).join(', ')}{
		  margin: 0;
		  padding: 0;
		}
		${t} button, ${t} input, ${t} select, ${t} textarea{
			color: inherit;
			font-weight: inherit;
			border:none;
			outline:none;
			margin: 0;
		}
		${t} a{
			color: ${Variables.link.color};
			text-decoration: none !important;
		}
		${t} a:hover{
			color: ${Variables.link.hover};
		}
		${t} ${cp}color-shadea3:hover{
			color: ${Variables.tones.shadea3};
		}
		${t} button:focus, ${t} a:focus, ${t} input:focus, ${t} select:focus{
			outline: none;
		}
		${t} button::-moz-focus-inner, ${t} a::-moz-focus-inner, ${t} select::-moz-focus-inner{
			border: 0;
		}
		${t} strong{
			color: ${Variables.text.strong};
			font-weight: ${Variables.weights.bold};
		}
		${t} table th{
			color: ${Variables.text.strong};
		}
		${t} table th, ${t} table td{
			padding: .2em .5em;
		}
		${t} iframe{
			opacity: 1;
			border: 0;
		}
		${t} figure img{
			-moz-user-select: none;
			-webkit-user-select: none;
			user-select: none;
			display:block;
			width: 100%;
			height: auto;
			max-width: 100%;
		}
	`.split('\n').map(e => e.trim()).join('');
};

const getSpacingHelpers = (spacing, shortClassNames) => {
	const props = ['margin', 'padding'],
		dirs = ['', '-left', '-top', '-right', '-bottom'],
		rules = {};
	
	const className = (p, d, name) => {
		return shortClassNames ? `${p[0]}${d[1]||'a'}-${name}` : `${p}${d}-${name}`;
	};
		
	for( const [name, space] of Object.entries({...spacing.relative, none: [0, 'px']})){
		for(const p of props){
			for(const d of dirs){
				//rules[className(p, d, name)] = {[p+d]: space.join('') + ' !important'};
				rules[className(p, d, name)] = {[p+d]: space.join('')};
			}
		}
	}
	
	for(let i=0; i<3; i++){
		dirs.reduce((acc, cur) => Object.assign(acc, {
			[className('border', cur, i||'none')]: {[`border${cur}`]: `${i}px solid currentColor`}
		}), rules);
	}
	
	return rules;
};

const portify = (rules, ports) => {
	ports = ports || Port.names.slice(1);
	return fixStyleProps({...rules, ...ports.slice(1).reduce((acc, cur) => {
		return Object.assign(acc, {[cur]: {
			meta: {
				state: '',
				include: Object.entries(rules).map(([k, v]) => [` ..${k}-${cur}`, v])
			},
			props: {}
		}});
	}, {})}, true);
};

export default {
	getClassStyles(Variables, shortClassNames){
		const {tones, sizes, weights, spacing, colors, radii, card, border} = Variables,
			alignments = [ "center", "justify", "left", "right" ];
			
		const labels = {
			display: shortClassNames ? 'd': 'display',
			'text-weight': shortClassNames ? 'tw': 'text-weight',
			'text-align': shortClassNames ? 'ta': 'text-align'
		};
		
		const fontsizes = Object.values(Variables.sizes).sort((a, b) => a < b ? 1 : -1).slice(0, -2);
		const Styles = {
			'float-left': { float: 'left' },
			'float-right': { float: 'right' },
			'clipped': { overflow: 'hidden' },
			'scroll-y': { 'overflow-y': 'auto' },
			'scroll-x': { 'overflow-x': 'auto' },
			'overflow-auto': { 'overflow': 'auto' },
			'of-cover': { 'object-fit': 'cover' },
						
			'capitalize': { 'text-transform': 'capitalize' },
			'lowercase': { 'text-transform': 'lowercase' },
			'uppercase': { 'text-transform': 'uppercase' },
			'italic': { 'font-style': 'italic' },
			'ws-nowrap': {'white-space': 'nowrap'},
			'ws-pre': {'white-space': 'pre'},
			'ws-pre-wrap': {'white-space': 'pre-wrap'},
			'to-ellipsis': {'text-overflow': 'ellipsis'},
			
			
			...[
				['title', tones.shadeb2, sizes.xxl, weights.semibold, 1.15],
				['subtitle', tones.shadeb1, sizes.l, weights.normal, 1.25]
			].reduce((acc, [name, color, size, weight, lh]) => {
				acc[name] = {
					meta: {
						state: '',
						include: name === 'title' ? 
							[[` + ..subtitle`, {'margin-top': '-1.25rem'}], [':not(:last-child)', {'margin-bottom': '1.5rem'}]]
							: []//[[` + ${class_prefix_dotted}is-subtitle`, {'margin-top': '-1.25rem'}]]
					},
					props: {
						color,
						'font-size': size.join(''),
						'font-weight': weight,
						'line-height': lh,
						display: 'block',
						'word-break': 'break-word'
					}
				};
				return acc;
			}, {}),
			
			'box': {
				'background': card.background ? tones.shadea5 : 'none',
				'border-radius': `${Variables.radii.normal}em`,
				'box-shadow': card.elevation ? `0px 2px 2.25px ${Variables.border.color}, 0px 0px 0px 1px ${withAlpha(Variables.border.color, .25)}` : 'none',
				'padding': spacing.relative.normal.join(''),
				border: card.border ? `1px solid ${border.color}` : 'none'
			},
			
			'bs-none': { 'box-shadow': 'none' },
			'bg-none': { 'background': 'none' },
						
			...['auto', 'text', 'not-allowed', 'pointer', 'move'].reduce((acc, cur) => Object.assign(acc, {[`cursor-${cur}`]: {cursor: cur}}), {}),
						
			...portify(
				{
					...['block', 'flex', 'inline', 'inline-block', 'inline-flex', 'none'].reduce((acc, d) => {
						return Object.assign(acc, {[`${labels.display}-${d}`]: { display: d }});
					}, {}),
					...['', '-left', '-top', '-right', '-bottom'].reduce((acc, cur) => {
						[['none', 0], ['sm', .05], ['sm', .125], ['md', .25], ['l', .375]].forEach(r => {
							//acc[`br${ cur[1] || 'a' }-${r[0]}`] = {[`border-radius${ cur ? cur : '' }`]: `${r[1]}em !important`};
							acc[`br${ cur[1] || 'a' }-${r[0]}`] = {[`border-radius${ cur ? cur : '' }`]: `${r[1]}em`};
						});
						return acc;
					}, {}),
					...getSpacingHelpers(spacing, shortClassNames)
				}
			),
						
			'ba-1-border': {border: `1px solid ${Variables.border.color}`},
			
			...[...Object.entries(colors), ...Object.entries(tones)].reduce((acc, cur) => Object.assign(acc, {[`bg-${cur[0]}`]: {background: cur[1]}}), {}),
			...[...Object.entries(colors), ...Object.entries(tones)].reduce((acc, cur) => Object.assign(acc, {[`bc-${cur[0]}`]: {'border-color': cur[1]}}), {}),
			...[...Object.entries(colors), ...Object.entries(tones)].reduce((acc, cur) => Object.assign(acc, {[`color-${cur[0]}`]: {color: cur[1]}}), {'color-text': {color: Variables.text.color}}),
			'color-inherit': {color: 'inherit'},
			
			'bg-shadeb4--wa': { background: withAlpha(tones.shadeb4, .9) },
			'invisible': { visibility: 'hidden' },
			'radiusless': { 'border-radius': '0 !important' },
			'round': { 'border-radius': '50%' },
			
			'fullwidth': { width: '100%' },
			'halfwidth': { width: '50%' },
			'fullheight': { height: '100%' },
			'halfheight': { height: '50%' },
			
			'relative': { position: 'relative' },
			'absolute': { position: 'absolute' },
			'absolute--cover': { top: 0, right: 0, bottom: 0, left: 0 },
			'fixed': { position: 'fixed' },
			'static': { position: 'static' },
			
			'fg-1': { 'flex-grow': 1 },
			'fg-0': { 'flex-grow': 0 },
			'fb-1': { 'flex-basis': 1 },
			'fb-0': { 'flex-basis': 0 },
			
			'icon': {'width': '1em', 'height': '1em', 'display': 'inline-flex'},
			
			'small-text': {'font-size': Variables.sizes.sm.join('')},
			'tiny-text': {'font-size': Variables.sizes.xs.join('')},
			...fontsizes.reduce((acc, cur, i) => Object.assign(acc, {
					[`h${i+1}`]: {'font-size': cur.join('')}
			}), {}),
			
			'lh-1': { 'line-height': 1 },
			'lh-115': { 'line-height': 1.15 },
			'lh-12': { 'line-height': 1.2 },
			'lh-125': { 'line-height': 1.25 },
			'lh-135': { 'line-height': 1.35 },
			'lh-15': { 'line-height': 1.5 },
			'lh-175': { 'line-height': 1.75 },
			'lh-2': { 'line-height': 2 },
			'lh-05': { 'line-height': .5 },
			
			'drop-shadow': { 'filter': `drop-shadow(0 0 15px ${tones.shadeb5})` },
			
			container: {margin: '0 auto'},
			
			'flex-row': {'flex-direction': 'row'},
			'flex-column': {'flex-direction': 'column'},
			'flex-wrap': {'flex-wrap': 'wrap'},
			'flex-nowrap': {'flex-wrap': 'nowrap'},
			'flex-none': {'flex': 'none'},
			
			'ac-stretch': {'align-content': 'stretch'},		
			
			...['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].reduce((acc, cur) => {
				const label = cur.split('-')[1] || cur;
				return Object.assign(acc, {[`jc-${label}`]: {'justify-content': cur}, [`ac-${label}`]: {'align-content': cur}});
			}, {}),
			
			...['flex-start', 'flex-end', 'center', 'baseline', 'stretch'].reduce((acc, cur) => {
				const label = cur.split('-')[1] || cur;
				return Object.assign(acc, {[`ai-${label}`]: {'align-items': cur}, [`as-${label}`]: {'align-self': cur}});
			}, {}),
			
			...alignments.reduce((acc, cur) => Object.assign(acc, {[`${labels['text-align']}-${cur}`]: {'text-align': cur}}), {}),
			...Object.entries(weights).reduce((acc, [name, weight]) => Object.assign(acc, {[`${labels['text-weight']}-${name}`]: {'font-weight': weight}}), {}),
			[`${labels['text-weight']}-inherit`]: {'font-weight': 'inherit'},
			
			...Object.entries(colors).reduce((acc, cur) => Object.assign(acc, {[cur[0]]: {color: cur[1]}}), {}),
			
			...[0, .25, .5, .75, , .85, 1].reduce((acc, cur) => Object.assign(acc, {[`opacity-${ cur.toString().replace('.', '') }`]: {opacity: cur}}), {}),
			
			//...[['xs', 32], ['sm', 48], ['normal', 64], ['md', 96], ['l', 128]].reduce((acc, cur) => Object.assign(acc, {[`size-${ cur[0] }`]: {width: `${cur[1]}px`, height: `${cur[1]}px`}}), {})
			...[['xs', 2], ['sm', 3], ['normal', 4], ['md', 6], ['l', 8]].reduce((acc, cur) => Object.assign(acc, {[`size-${ cur[0] }`]: {width: `${cur[1]}em`, height: `${cur[1]}em`}}), {}),
			//'ml-author-offset': {'margin-left': `3em`},
		};
		return fixStyleProps(Styles, true);
	},
	
	generateCSS(Variables, themespace, class_prefix_dotted, shortClassNames, id){
		return getBaseStyles(themespace, Variables, class_prefix_dotted, id) + [
			this.getClassStyles(Variables, shortClassNames),
			getContainerClasses(),
			getSectionClasses()
		].map(styles => makeCSS(
			Object.keys(styles),
			styles,
			themespace + ' ' + class_prefix_dotted,
			Variables,
			class_prefix_dotted
		)).join('');
	},
	
	getSearchableStyles(Variables){
		return [
			this.getClassStyles(Variables),
			getContainerClasses(),
			getSectionClasses()
		].map(styles => indexStyles(styles, styles));
	}
};
