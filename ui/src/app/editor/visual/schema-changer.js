import {dc, groupBy} from '../../../libs/bp';
import Domu from '../../../libs/dom/domu';
import Vue from 'vue';

import Elements from '../../instance/dom/';

export default new Vue({
	data(){
		return {
			App: null,
			Evue: null,
			Selected: {},
			View: 'main'
		}
	},
	
	created(){
		this.Root = null;
		this.Backups = null;
		this.Elements = Elements;
		this.setPristine();
		this.Sheet = Domu.createStyleSheet().sheet;
	},
	
	computed: {
		ElementOptions(){
			return groupBy(Object.values(this.App.dom).filter(el => {
				return el.type && el.type !== el.component;
			}), 'type');
		},
		
		Element(){
			return this.App.dom[this.Selected.eid] || null;
		},
		
		AppLists(){
			if( !this.Evue || !this.Evue.state ) return [];
			return Object.entries(this.Evue.state.lists).filter(e => e[1]);
		},
		
		ElementSelectables(){
			return this.ElementOptions[ this.Element.type ];
		},
		
		ElementHasSchema(){
			return this.Elements[ this.Element.key ].schema;
		},
		
		ElementHasESchema(){
			return this.Elements[ this.Element.key ].eschema;
		},
		
		ThemeValue(){
			return this.Root.Editor.Themes[ this.App.app.value.theme ].value;
		}
	},
	
	watch: {
		AppLists(n, o){
			this.listsChanged(n);
		}
	},
		
	methods: {
		setPristine(){
			this.Dirty = {
				Lists: {},
				Elements: {}
			};
		},
		
		setRootVue(v){
			this.Root = v;
		},
		
		setApp(app, evue){
			//this.App = {...app, dom: this.Elements};
			this.App = app;
			this.Evue = evue;
			this.createBackup();
		},
		
		listsChanged(lists){
			if( !this.Backups ) return false;
			const lids = lists.map(e => e[0]);
			for(const [lid, list] of lists){
				if( !list.is_dynamic && !this.Backups.lists[lid] ){	// new list found
					this.Backups.lists[lid] = dc(list.components);
				}
			}
			
			for(const lid in this.Backups.lists){
				if( !lids.includes(lid) ){	// list removed
					delete this.Backups.lists[lid];
					delete this.Dirty.Lists[lid];
					if( this.Selected.lid === lid ){
						this.deSelectElement();
					}
				}
			}
		},
		
		createBackup(){
			const {dom, theme, app} = this.App;
			const lists = Object.entries(app.value.lists.lists)
				.reduce((acc, cur) => Object.assign(acc, {[cur[0]]: dc(cur[1].components)}), {});
			this.Backups = {dom: dc(dom), theme: dc(theme), lists};
		},
		
		selectElement(ids){
			this.Selected = {...this.Selected, ...ids};
			this.Root.$store.commit(`SELECT_ELEMENT`, ids.eid);
		},
		
		// selectElement will switch to the root list
		deSelectElement(){
			this.Selected = {};
			this.Root.$store.commit(`SELECT_ELEMENT`, null);
		},
		
		unSelectElement(){
			this.Selected.eid = null;
			this.Root.$store.commit(`SELECT_ELEMENT`, null);
		},
		
		setDirtyElement( eid ){
			this.Dirty.Elements[eid || this.Selected.eid] = true;
		},
		
		getGlobalTypedComponent(cid, type){
			return this.App.dom[ cid ].components[ type ];
		},
		
		changeElement(eid){
			if( this.Selected.cid ){
				this.setDirtyElement( this.Selected.cid );
				this.App.dom[this.Selected.cid].components[ this.Element.type ] = eid;
			} else {
				this.Dirty.Lists[this.Selected.lid] = true;
				this.Root.$store.commit(`emodule/CHANGE_LIST_COMPONENT`, {
					lid: this.Selected.lid, 
					component: this.Element.type, 
					eid
				});
			}
		},
				
		reset(){
			this.App = null;
			this.Evue = null;
			this.Backups = null;
			this.Selected = {};
			this.setPristine();
			this.deSelectElement();
			this.View = 'main'
		},
		
		cleanup(){
			this.reset();
		},
		
		cancel(){
			for(const lid in this.Dirty.Lists){
				this.Root.$store.commit(`emodule/CHANGE_LIST_COMPONENTS`, {
					lid, 
					components: dc(this.Backups.lists[lid])
				});
			}
			
			for(const eid in this.Dirty.Elements){
				this.App.dom[eid] = dc(this.Backups.dom[eid]);
			}
			
			if( this.Dirty.Theme ){
				this.App.theme = dc(this.Backups.theme);
				this.Root.Editor.Themes[ this.App.app.value.theme ].value = this.App.theme;
			}
					
			this.setPristine();
			this.deSelectElement();
		},
		
		save(){
			return {
				lists: Object.keys(this.Dirty.Lists).reduce((acc, cur) => 
					Object.assign(acc, {[cur]: this.Evue.state.lists[cur].components}), {}
				),
				dom: Object.keys(this.Dirty.Elements).reduce((acc, cur) => 
					Object.assign(acc, {[cur]: this.App.dom[cur]}), {}
				),
				theme: this.Dirty.Theme ? this.App.theme : null
			};
		}
	}
});
