import AbstractReusable from './AbstractReusable';
import {darken, invert} from './CSS';

export default class Tabs extends AbstractReusable{
	defaultProps(){
		return {};
	}
	
	getClassStyles(){
		const {colors, tones, sizes, radii, border} = this.Scheman.Variables;
		const border_width = '1px';
		
		const Styles = {
			'tabs': {
				meta: {
					state: '',
					include: [
						[' > *', 'tabs-wrapper'],
						['..fullwidth ..tab', {'flex-grow': 1}],
						[' ..tab', 'tab'],
						['..boxed ..tab', 'boxed-tab'],
						[' ..tab..active', 'active-tab']
					]
				},
				props: {
					overflow: 'hidden',
					'overflow-x': 'auto',
					'white-space': 'nowrap'
				}
			}
		};
		
		return Styles;
	}
	
	getClassHelperStyles(){
		const {colors, tones, radii, border, link} = this.Scheman.Variables;
		const border_width = '2px';
		
		return {
			'tabs-wrapper': {
				display: 'flex',
				'flex-grow': 1,
				'border-bottom': `${border_width} solid ${border.color}`
			},
			'tab': {
				meta: {
					state: '',
					include: [
						[':hover', {'border-bottom-color': border.hover}]
					]
				},
				props: {
					cursor: 'pointer',
					padding: '.5em 1em',
					'border-bottom': `${border_width} solid ${border.color}`,
					'margin-bottom': `-${border_width}`
				}
			},
			'boxed-tab': {
				meta: {
					state: '',
					include: [
						[':hover', {'background': tones.shadea4, 'border-bottom-color': border.color}],
						['..active', {'background': tones.shadea3, 'border-color': border.color, 'border-bottom-color': 'transparent'}]
					]
				},
				props: {
					'border-radius': `${radii.normal}em ${radii.normal}em 0 0`,
					'border': `${border_width} solid transparent`,
				}
			},
			'active-tab': {
				'color': link.color,
				'border-bottom-color': link.color
			}
		};
	}
	
	generateCSS(){
		const Helpers = this.getClassHelperStyles();		
		const Styles = this.getClassStyles();
		
		return this.makeCSS(Styles, {...Styles, ...Helpers});
	}
}
