import Vue from 'vue';
Vue.config.productionTip = false;

import {Variables, designVariables} from '../libs/dom/base';
import {mergeAutoVariables, mergeAutoColors} from '../libs/dom/reusables/CSS';

import {PortMixin} from '../libs/dom/port';
import Scheman from '../libs/dom/scheman';
import resetcss from '../libs/dom/reset.css';
import Domu from '../libs/dom/domu';

import Store from './store';
import Editor from './editor/Editor.vue';
import Styles from './editor/style.css';

import BaseMixin from './mixins/BaseMixin';
import Notifications from 'vue-notification';
Vue.use(Notifications);

const scheman = new Scheman(designVariables(
	mergeAutoVariables(mergeAutoColors(Variables), document.body)
));
scheman.createStyleClasses(resetcss+Styles);
//Domu.createStyleSheet(resetcss);

//console.log(Domu);

const isEmbed = Domu.$('#cs-editor');

const root = new Vue({
	mixins: [BaseMixin, PortMixin],
	el:  isEmbed ? '#cs-editor' : '#app',
	
	components: {
		Editor
	},
		
	template: `
		<div class="themespace-0">
			<div class="instance" id="instance-0">
				<div class="section">
					<div class="container is-fluid">
						<Editor :style="margin"></Editor>
					</div>
				</div>
			</div>
		</div>
	`,
	
	computed: {
		margin(){
			return isEmbed ? '' : 'margin-left:150px';
		}
	},
			
	store: Store
});

//SchemaChanger.setRootVue(root);
//window.SchemaChanger = SchemaChanger;
