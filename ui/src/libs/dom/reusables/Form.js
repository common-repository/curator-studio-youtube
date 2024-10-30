import AbstractReusable from './AbstractReusable';
import {darken, invert, withAlpha} from './CSS';

export default class Button extends AbstractReusable{
	defaultProps(){
		return {};
	}
	
	getClassStyles(){
		const {colors, tones, sizes, spacing, weights} = this.Scheman.Variables;
		const sizemap = {tiny: 'xs', small: 'sm', normal: 'normal', medium: 'md', large: 'l'};
		
		const Styles = {
			label: {
				display: 'block',
				color: tones.shadeb1,
				'margin-bottom': spacing.relative.sm.join(''),
				'font-weight': weights.semibold,
				'font-size': sizes.normal.join('')
			},
			
			help: {
				display: 'block',
				'font-size': sizes.sm.join(''),
				'margin-top': spacing.relative.xs.join('')
			},
			
			control: {
				meta: {
					state: '',
					include: [
						[' ..input', {width: '100%'}]
					]
				},
				props: {}
			},
			
			input: this.getInputBase(),
			
			checkbox: {
				meta: {
					state: '',
					include: [
						[' input', {cursor: 'pointer'}],
						[':hover', {'color': tones.shadeb2}],
						[':disabled', {'color': tones.shadea1}],
					]
				},
				props: {
					cursor: 'pointer',
					display: 'inline-flex',
					'line-height': 1.5
				}
			},
			radio: {
				meta: {
					state: '',
					include: [
						[' input', {cursor: 'pointer'}],
						[':hover', {'color': tones.shadeb2}],
						[':disabled', {'color': tones.shadea1}],
					]
				},
				props: {
					cursor: 'pointer',
					display: 'inline-flex',
					'line-height': 1.5
				}
			},
			select: {
				meta: {
					state: '',
					include: [
						[' select', 'select-element'],
						['::after', {
							content: "' '",
							position: 'absolute',
							'border-left': '3px solid',
							'border-bottom': '3px solid',
							'width': '.625em',
							'height': '.625em',
							'transform': 'rotate(-45deg)',
							'top': '.775em',
							'pointer-events': 'none',
							right: '1.125em',
							'z-index': 4
						}],
					
						[`..fullwidth`, 'fullwidth'],
						[`..static`, 'static'],
						
						...['tiny', 'small', 'normal', 'medium', 'large'].map(s => [`..${s}`, {'font-size': sizes[sizemap[s]].join('')}])
					]
				},
				props: {
					position: 'relative',
					'display': 'inline-flex'
				}
			}
		};
		
		return Styles;
	}
	
	getInputBase(){
		const {colors, tones, sizes, radii} = this.Scheman.Variables;
		
		const border_width = '1px',
			pad_y = `calc(0.375em - ${border_width})`,
			pad_x = `calc(0.625em - ${border_width})`;
							
		const sizemap = {tiny: 'xs', small: 'sm', normal: 'normal', medium: 'md', large: 'l'};
		
		return {
			meta: {
				state: '',
				include: [
					['::placeholder', {color: withAlpha(tones.hue, .95)}],
					[[':hover', '..hovered'], {'border-color': tones.shadea1}],
					[[':focus', '..focused'], {'border-color': colors.link}],
					[[':disabled', '..disabled'], 'disabled'],
					
					[[':hover', '..hovered'], {'z-index': 2}],
					[[':focus', '..focused', ':active', '..active'], {outline: 'none', 'z-index': 3}],
				
					[`..fullwidth`, 'fullwidth'],
					[`..static`, 'static'],
										
					[`..small`, {'border-radius': `${radii.small}em`}],
					...['tiny', 'small', 'normal', 'medium', 'large'].map(s => [`..${s}`, {'font-size': sizes[sizemap[s]].join('')}])
				]
			},
			props: {
				'-moz-appearance': 'none',
				'-webkit-appearance': 'none',
				'align-items': 'center',
				'box-shadow': 'none',
				'display': 'inline-flex',
				'font-size': sizes.normal.join(''),
				'line-height': 1.5,
				'border': `${border_width} solid transparent`,
				'border-radius': `${radii.normal}em`,
				'border-color': tones.shadea2,
				'background-color': tones.shadea5,
				color: tones.shadeb2,
				'justify-content': 'center',
				'padding-top': pad_y,
				'padding-right': pad_x,
				'padding-bottom': pad_y,
				'padding-left': pad_x,
				position: 'relative',
				'min-width': 0,
				'height': '2.5em'
			}
		};
	}
	
	getClassHelperStyles(){
		const {tones, card} = this.Scheman.Variables;
		const {meta:{include}, props} = this.getInputBase();
		
		return {
			disabled: {
				meta: {
					state:'',
					include: [
						['::placeholder', {color: withAlpha(tones.shadea1, .5)}]
					]
				},
				props: {
					'cursor': 'not-allowed',
					'border-bottom-color': tones.shadea4,
					'background-color': tones.shadea4,
					'color': tones.shadea1
				}
			},
			'fullwidth': {
				display: 'flex',
				width: '100%'
			},
			'static': {
				'background-color': 'transparent',
				'border-color': 'transparent',
				'padding-left': 0,
				'padding-right': 0
			},
			'select-element': {
				meta: {
					state: '',
					include: [
						...include,
						['::-ms-expand', {display: 'none'}],
						['[multiple]', {height: 'auto'}]
					]
				},
				props: {
					...props,
					cursor: 'pointer',
					'padding-right': '2.25em'
				}
			}
		};
	}
	
	generateCSS(){
		const Helpers = this.getClassHelperStyles();		
		const Styles = this.getClassStyles();
		
		return this.makeCSS(Styles, {...Styles, ...Helpers});
	}
}
