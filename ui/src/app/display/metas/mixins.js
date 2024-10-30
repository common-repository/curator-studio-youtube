import BaseMixin from '../../mixins/BaseMixin';
import {RenderHelpers} from '../../elements';
import Stats from './Stats.vue';
import Subscribe from './Subscribe.vue';

const MetaMixin = {
	mixins: [BaseMixin, RenderHelpers],
	inject: ['portmedia'],
	props: ['meta'],
	
	computed: {
		small(){
			const {size} = this.portmedia;
			return size === 'xs';
		},
		
		i18n(){
			return this.getI18n('meta');
		},
		
		numAbbrs(){
			return this.getI18n('numbers');
		}
	},	
	
	components: {
		Stats,
		Subscribe
	}
};

export {MetaMixin};
