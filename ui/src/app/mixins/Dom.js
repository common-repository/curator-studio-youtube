import {PortMixin} from '../../libs/dom/port';
import Scheman from '../../libs/dom/scheman';
import {uuid, getDeepProp} from '../../libs/bp';

import {designVariables, Variables} from '../../libs/dom/base';
import {mergeAutoVariables} from '../../libs/dom/reusables/CSS';

import BaseMixin from '../mixins/BaseMixin';
import Loading from '../components/Loading.vue';
import ApiMixin from '../mixins/ApiMixin';

//import Elements from '../instance/dom/index';
import i18n from '../instance/display/i18n';
import Styles from '../style.css';

const Schemans = {};

export default{
	mixins: [BaseMixin, PortMixin, ApiMixin],
		
	provide(){
		return {
			Elements: this.Elements,
			getCurrentAppId: this.getCurrentAppId,
			getI18n: this.egetI18n
		};
	},
			
	components: {
		Loading
	},
		
	computed: {
		Elements(){
			//return Elements;
			return this.instance.dom;
		},
		
		instanceId(){
			return uuid();
		},
		
		themeId(){
			return this.instance.app.value.theme;
		},
		
		i18n(){
			const platform = process.env.VUE_APP_PLATFORM;
			if( window.csvars && window.csvars[platform] )
				return window.csvars[platform].translations || i18n;
			return (this.$store && this.$store.state.Translations) || i18n;
		}
	},
	
	created(){
		if( Schemans[this.themeId] ) return false;
		this.Scheman = new Scheman(designVariables(mergeAutoVariables(this.instance.theme, document.body)), this.instanceId, this.themeId);
		//this.Scheman = new Scheman(designVariables(mergeAutoVariables(Variables, document.body)), this.instanceId, this.themeId);
		this.Scheman.createStyleClasses(Styles);
		Schemans[this.themeId] = this.Scheman;
		
		this.$watch('instance.theme', (n, o) => {
			this.Scheman.updateRules(designVariables(
				mergeAutoVariables(n, document.body)
			));
		}, {deep: true});
	},
		
	methods: {
		egetI18n( path ){
			return getDeepProp(this.i18n, path);
		},
		
		getCurrentAppId(){
			return this.instance.app.id;
		}
	},
	
	destroyed(){
		this.Scheman.removeStyleSheet();
		delete Schemans[this.themeId];
	}
};

