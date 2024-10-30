import AbstractReusable from './AbstractReusable';
import {darken, invert, withAlpha} from './CSS';

export default class Button extends AbstractReusable{
	defaultProps(){
		return {
			text: '',
			styles: [],
			classes: [],
			events: []
		};
	}
	
	getClassStyles(){
		const c = this.class_prefix_dotted;
		const {colors, tones, sizes, radii, card, border} = this.Scheman.Variables;
		
		const border_width = '1px',
			pad_y = `calc(0.375em - ${border_width})`,
			pad_x = '0.75em';
							
		const sizemap = {tiny: 'xs', small: 'sm', normal: 'normal', medium: 'md', large: 'l'};
		const shadow = `0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)`;
		
		const Styles = {
			'button': {
				meta: {
					state: '',
					include: [
						[[':hover', '..hovered'], {'z-index': 2}],
						[[':focus', '..focused', ':active', '..active'], {outline: 'none', 'z-index': 3}],
						[['[disabled]', '..disabled'], {cursor: 'not-allowed'}],
						
						[[':hover', '..hovered'], `hovered`],
						[[':focus', '..focused'], `focused`],
						[[':active', '..active'], `active`],
						
						[`..text`, `text`],
						
						...Object.keys(colors).map(co => [`..${co}`, co]),
						
						[`..fullwidth`, 'fullwidth'],
						[`..static`, 'static'],
						
						[`..square`, {'width': `2.5em`}],
						
						//[`..small`, {'border-radius': `${radii.small}em`}],
						...['tiny', 'small', 'normal', 'medium', 'large'].map(s => [`..${s}`, {'font-size': sizes[sizemap[s]].join('')}])
					]
				},
				props: {
					display: 'inline-flex',
					'align-items': 'center',
					'box-shadow': card.elevation ? shadow : 'none',
					//position: 'relative',
					'font-size': sizes.normal.join(''),
					'line-height': 1.5,
					'background-color': tones.shadea5,
					'border': `${border_width} solid transparent`,
					'border-color': tones.shadea2,
					'border-width': border_width,
					'border-radius': `${radii.normal}em`,
					color: tones.shadeb2,
					cursor: 'pointer',
					'justify-content': 'center',
					'text-align': 'center',
					'vertical-align': 'top',
					'white-space': 'nowrap',
					'padding-top': pad_y,
					'padding-right': pad_x,
					'padding-bottom': pad_y,
					'padding-left': pad_x,
					height: '2.5em',
				}
			},
			'buttons': {
				meta: {
					state: '',
					include: [
						[' ..button', {'margin-bottom': '.5rem'}],
						[' ..button:not(..fullwidth):not(:last-child)', {'margin-right': '.5rem'}],
						[':last-child', {'margin-bottom': '-.5rem'}]
					]
				},
				props: {}
			},
			'gap': {
				meta: {
					state: '',
					include: [
						[' ..button:not(..fullwidth):not(:last-child)', {'margin-right': '.5rem'}],
					]
				},
				props: {}
			},
			'wide': {
				meta: {
					state: '',
					include: [
						[' ..button', {'flex-grow': .15}],
					]
				},
				props: {}
			},
			attached: {
				meta: {
					state: '',
					include: [
						[
							[' ..control:not(:last-child)'],
							{'margin-right': `-${border_width}`}
						],
						[
							[
								' ..control:first-child:not(:only-child) ..button',
								' ..control:first-child:not(:only-child) ..input',
								' ..control:first-child:not(:only-child) ..select select'
							],
							{'border-bottom-right-radius': 0, 'border-top-right-radius': 0}
						],
						[
							[
								' ..control:last-child:not(:only-child) ..button',
								' ..control:last-child:not(:only-child) ..input',
								' ..control:last-child:not(:only-child) ..select select',
							],
							{'border-bottom-left-radius': 0, 'border-top-left-radius': 0}
						],
						[' ..button:not(:last-child)', {'border-bottom-right-radius': 0, 'border-top-right-radius': 0, 'margin-right': '-1px'}],
						[' ..button:not(:first-child)', {'border-bottom-left-radius': 0, 'border-top-left-radius': 0}]
					]
				},
				props: {}
			}
		};
								
		return Styles;
	}
	
	getClassHelperStyles(){
		const {colors, tones, link, text, background} = this.Scheman.Variables;
		
		const colored = Object.entries(colors).reduce((acc, [name, color]) => {
			const inverted = invert(color);
			acc[`${name}`] = {
				meta: {
					state: '',
					include: [
						...[':hover', `..hovered`].map(sel => [sel, {
							'background-color': darken(color, 2.5),
							'border-color': 'transparent',
							color: inverted
						}]),
						...[':focus', `..focused`].map(sel => [sel, {
							'border-color': 'transparent',
							color: inverted
						}]),
						...[':active', `..active`].map(sel => [sel, {
							'background-color': darken(color, 5),
							'border-color': 'transparent',
							color: inverted
						}]),
						...['[disabled]', `..disabled`].map(sel => [sel, {
							'background-color': color,
							'border-color': 'transparent'
						}]),
						[`..outlined`, 'outlined', {color, inverted}]
					]
				},
				props: {
					'background-color': color,
					'border-color': 'transparent',
					color: inverted
				}
			};
			return acc;
		}, {});
		
		return {
			...colored,
			'text':{
				meta: {
					state: '',
					include: [
						[':hover', `text-hovered`],
						[`..hovered`, `text-hovered`],
						[':focus', `text-hovered`],
						[`..focused`, `text-hovered`],
						[':active', `text-active`],
						[`..active`, `text-active`],
						['[disabled]', `text-disabled`],
						[`..disabled`, `text-disabled`],
					]
				},
				props: {
					'background-color': 'transparent',
					'border-color': 'transparent',
					color: text.color,
					'text-decoration': 'underline'
				}
			},
			'fullwidth': {
				display: 'flex',
				width: '100%'
			},
			'static': {
				'background-color': tones.shades3,
				'border-color': tones.shadea1,
				'color': tones.hue,
				'pointer-events': 'none'
			},
			'hovered':{
				'border-color': link.hover_border,
				'color': link.hover
			},
			'focused':{
				'outline': 'none',
				'border-color': link.focus_border,
				'color': link.focus
			},
			'active':{
				'outline': 'none',
				'border-color': link.active_border,
				'color': link.active
			},
			'text-hovered':{
				'outline': 'none',
				'background-color': background,
				'color': text.strong
			},
			'text-active':{
				'outline': 'none',
				'background-color': darken(background, 5),
				'color': text.strong
			},
			'text-disabled':{
				'background-color': 'transparent',
				'border-color': 'transparent'
			},
			'outlined': {
				meta: {
					state: '',
					include: [
						...[':hover', `..hovered`, ':focus', `..focused`].map(sel => [sel, {
							'background-color': {key: 'color'},
							'border-color': {key: 'color'},
							color: {key: 'inverted'}
						}]),
						...['[disabled]', `..disabled`].map(sel => [sel, {
							'background-color': 'transparent',
							'border-color': {key: 'color'},
							color: {key: 'color'}
						}]),
					]
				},
				props: {
					'background-color': 'transparent',
					'border-color': {key: 'color'},
					color: {key: 'color'}
				}
			}
		};
	}
		
	generateCSS(){
		const Helpers = this.getClassHelperStyles();		
		const Styles = this.getClassStyles();
		
		return this.makeCSS(Styles, {...Styles, ...Helpers});
	}
	
	getSchema(props={}){
		const {classes, text, events, styles, ...rest} = {...this.defaultProps(), ...props};
		
		const Elements = {
			'1':{
				name: 'button',
				tag: 'button',
				attrs: {
					type: 'button'
				},
				classes,
				events,
				styles,
				...rest,
				text: {
					type: typeof text === 'string' ? 'raw' : text[0],
					value: typeof text === 'string' ? text : text[1]
				}
			}
		};
		
		const Events = {};
		
		return {Elements, Events};
	}
};
