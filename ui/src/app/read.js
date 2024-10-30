import Vue from 'vue';
Vue.config.productionTip = false;

import debounce from 'lodash.debounce';
import Domu from '../libs/dom/domu';

import Dom from './mixins/Dom';
import ApiMixin from './mixins/ApiMixin';

import Explorer from './components/Explorer.vue';
import Singles from './components/Singles.vue';

const editApp = (app) => {
	const {root, lists} = app.value.lists;
	if( lists[root].list.open ){
		lists[root].list.viewer.autoplay = true;
	}
	
	//const lid = lists[root].items[0].child_list;
	//lists[root].list.multiple = true;
	//lists[root].list.viewer.mode = 1;
	//lists[root].list.viewer.preload = -1;
	//lists[root].list.viewer.autoplay = false;
	//lists[root].list.viewer.start = 10;
	//lists[root].list.viewer.comments = -1;
	//lists[root].components.List = 'masonry';
	//lists[root].components.Item = 'simple-item';
	//lists[root].components.LightList = 'light-list-sequence';
	
	return app;
};

const instanceApp = (cs, item) => {
	return {
		app: editApp(item),
		theme: cs.apps[ item.value.theme ].value,
		dom: cs.apps[ item.value.dom ].value
	};
};

const observeResize = elem => {
	if( !window.ResizeObserver ) return;
	
	const observer = new ResizeObserver(debounce(() => {
		cstudio_coordinator.$emit('resize');
	}, 150));
	
	observer.observe(elem);
};

const start = cs => {
	for(const i of cs.instances){
		const app = cs.apps[i];
		const {root, lists} = app.value.lists;
		const container = Domu.$(`#cs-app-${i}`).parentNode;
		
		new Vue({
			el: `#cs-app-${i}`,
			mixins: [lists[root].list.open ? Singles : Explorer],
			
			data(){
				return {
					instance: instanceApp( cs, app ),
					storekey: `module-${i}`
				};
			}
		});
		
		observeResize( container );
	}
};


if( window.csvars ){
	start(csvars[process.env.VUE_APP_PLATFORM]);
} else {
	Domu.$('#app').parentNode.style = 'max-width:1100px;margin:2em auto; padding: 0 1em;font-family:helvetica, sans-serif;';
		
	Domu.createStyleSheet(`
		@media(max-width:576px){
			html{
				font-size: 14px;
			}
		}
	`);
	
	const toKV = (arr, key) => {
		return arr.reduce((acc, cur) => {
			return {...acc, [cur[key]]: cur};
		}, Object.create(null));
	};
	
	new Vue({
		mixins: [ApiMixin],
		
		created(){
			this.GET('/apps/')
				.then((data) => {
					const cs = {
						apps: toKV(data, 'id'),
						instances: data.filter(d => d.type === 'app').map(d => d.id)
					};
					
					for(const i of cs.instances){
						Domu.createElement(
							'div', 
							{id: `cs-app-${i}`},
							Domu.createElement('div', {style: 'margin-bottom: 3em'}, '#app')
						);
					}
					
					start(cs);
				})
				.catch(er => console.log(er));
		}
	});
}
