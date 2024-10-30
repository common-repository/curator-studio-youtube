import AbstractReusable from './AbstractReusable';
import {compile, withAlpha} from './CSS';
import {uuid, range} from '../../bp';

const cardShadow = color => {
	return `0px 3px 1px -2px ${color}, 0px 2px 2px 0px ${color}, 0px 1px 5px 0px ${color}`;
};

export default class Card extends AbstractReusable{
	defaultProps(){
		return {};
	}
		
	getClassStyles(){
		const {spacing:{relative}, tones, radii, border, colors, card} = this.Scheman.Variables;
		//const shadow = cardShadow(`rgba(0, 0, 0, 0.2)`);
		const shadow = cardShadow(withAlpha(tones.hue, .35));
		
		const fb = card.background ? tones.shadea3 : 'rgba(0, 0, 0, .055)';
		const cardprops = {
			background: card.background ? tones.shadea5 : 'none',
			border: card.border ? `1px solid ${border.color}` : 'none',
			'box-shadow': card.elevation ? shadow : 'none',
			'border-radius': `${radii.normal}em`,
		};
						
		const Styles = {
		
			card: {
				meta:{
					state: '',
					include: [
						[` ..card__image`, {'display': 'block', 'position': 'relative'}],
						[` ..card__footer`, {
							'border-top': `1px solid ${fb}`,
							'display': 'flex',
							'align-items': 'stretch'
						}],
						[` ..card__footer:not(:last-child)`, {'border-bottom': `1px solid ${fb}`}],
						[` ..card__footer__item:not(:last-child)`, {'border-right': `1px solid ${fb}`}],
						[` ..card__footer__item`, {
							'align-items': 'center',
							display: 'flex',
							'flex-basis': 0,
							'flex-grow': 1,
							'flex-shrink': 0,
							padding: `${relative.sm.join('')} 0em`
						}]
					]
				},
				props: {
					'position': 'relative',
					'overflow': 'hidden',
					...cardprops
				}
			}
		};
		return Styles;
	}
	
	getClassHelperStyles(){
		const {tones, border, card, radii, colors} = this.Scheman.Variables;
		
		const props = {
			'card--border-none': {
				border: 'none'
			},
			'card--elevation-none': {
				'box-shadow': 'none'
			},
			'card--bg-none': {
				background: 'none'
			},
			'card--bg': {
				background: tones.shadea5
			},
			'card--br': {
				'border-radius': `${radii.normal}em`,
			},
			'card--highlight': {
				background: card.background ? tones.shadea3 : 'rgba(0, 0, 0, .045)'
			}
		};
		
		if( card.border ){
			props['card--border'] = {
				border: `1px solid ${border.color}`
			};
		}
		
		if( card.elevation ){
			props['card--elevation'] = {
				'box-shadow': cardShadow(withAlpha(tones.hue, .35))
			};
		}
		
		if( card.elevation ){
			props['card--active'] = {
				'box-shadow': cardShadow(withAlpha(colors.primary, .35))
			};
		} else {
			props['card--active'] = {
				border: `1px solid ${colors.primary}`
			};
		}
		
		return props;
	}
		
	generateCSS(){
		const Helpers = this.getClassHelperStyles();		
		const Styles = {...this.getClassStyles(), ...Helpers};
		return this.makeCSS(Styles, {...Styles});
	}
		
	getSchemas(props){
		const Elements = {
			'1':{
				name: 'card',
				tag: 'div',
				children: []
			}
		},
		
		Events = {};
		
		return {Elements, Events};
	}
	
	replaced(id, args){
		const elems = this.Scheman.Elements;
		for(const [i, colid] of Object.entries(elems[id].children)){
			if(args[i]) elems[colid].children.push(args[i]);
		}
	}
};
