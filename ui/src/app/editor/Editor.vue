<template>
	<div class="relative">
		<NotificationHolder></NotificationHolder>
		<Loading v-if="loading"></Loading>
		
		<div>
			<div class="tabs tw-semibold h4 mb-normal">
				<ul class="d-inline-flex">
					<li class="tab" :class="{active: isActiveTab(0)}" @click="activateTab(0)">Apps</li>
					<li v-for="(tab, i) in Tabs" class="tab" :class="{active: isActiveTab(i+1)}" @click="activateTab(i+1)">{{ tab[1] }}</li>
				</ul>
			</div>
		
			<div v-if="isActiveTab(0)">
				<AppList :d="d" :items="Apps" 
					@save-item="saveApp" 
					@remove-item="removeApp" 
					@change-lists="changeAppLists"
					style="width: calc(100% - 350px)">
				</AppList>
				<div class="fixed" style="right:1em;width:350px;top:100px;max-height:calc(100vh - 140px);overflow:auto">
					<StyleManager></StyleManager>
				</div>
			</div>
			
			<component v-for="(tab, i) in Tabs" :is="tab[0]" v-if="isActiveTab(i+1)"></component>
		</div>
	</div>				
</template>

<script>
	import {DimMixin} from '../../libs/dom/port';
	import {createListData} from '../../libs/list/utils';
	import {ListMutatorsMixin} from '../../libs/list/mixins';
	import {dc} from '../../libs/bp';
	
	import ApiMixin from '../mixins/ApiMixin';
	import BaseMixin from '../mixins/BaseMixin';
	import Loading from '../components/Loading.vue';
	
	import AppList from './AppList.vue';
	
	import SchemaChanger from './visual/schema-changer';
	import StyleManager from './visual/StyleManager.vue';
	import {TabMixin} from './visual/mixins';
	
	import FElements from '../instance/dom/index.js';
	import Elements, {cloneElements} from '../instance/dom/';
	
	import Vue from 'vue';
	import VTooltip from 'v-tooltip';
	
	import compareVersions from 'compare-versions';
	import * as jdp from 'jsondiffpatch';
	import Config from '../instance/config';
	
	import Tabs from './tabs';
	
	Vue.use(VTooltip);
			
	const toKV = (arr, key) => {
		return arr.reduce((acc, cur) => {
			return {...acc, [cur[key]]: cur};
		}, Object.create(null));
	};
	
	const excludeMoves = d => {
		for(const k in d){
			if(d[k].children){
				for(const c in d[k].children){
					if( Array.isArray(d[k].children[c]) && d[k].children[c][2] === 3 ){
						delete d[k].children[c];
					}
				}
			}
		}
		return d;
	};
	
	export default{
		mixins: [BaseMixin, ListMutatorsMixin, ApiMixin, TabMixin],
		
		provide(){
			return {
				coApps: this.coApps,
				isEditor: true,
				SchemaChanger
			};
		},
			
		data(){
			return {
				activeTab: 0,
				Editor: {
					Apps: {},
					Themes: {},
					Doms: {}
				},
				d: createListData({
					select_key: 'id'
				})
			};
		},
		
		computed: {
			Apps(){
				return Object.values(this.Editor.Apps);
			},
			
			Tabs(){
				return Tabs.tabs;
			}
		},
		
		components: {
			Loading,
			AppList,
			StyleManager,
			...Tabs.components,
			NotificationHolder: {
				template: `
					<div class="h4 d-flex jc-center">
						<notifications position="top center" width="auto"></notifications>
					</div>
				`
			}
		},
		
		mounted(){
			if( localStorage.getItem('editor') ){
				return this.initApps(JSON.parse(localStorage.getItem('editor')));
			}
			this.GET('/editor-data/')
				.then((data) => {
					if( data.apps.length ){
						//localStorage.setItem('editor', JSON.stringify(data));
					}
					this.initApps(data);
				})
				.catch(er => console.log(er));
		},
		
		created(){
			SchemaChanger.setRootVue(this);
		},

		methods: {
			checkVersions(apps){
				const upgrades = [];
				for(const v of Object.values(apps.Doms)){
					for(const e of Object.values(v.value)){
						if( Array.isArray(e.eclasses) ){
							e.eclasses = {};
						}
					}
					
					if( compareVersions(v.version, Config.versions.dom, '<') ){
						const jd = jdp.create();
						const d = jd.diff(cloneElements(FElements), cloneElements(Elements));
						jd.patch(v.value, d);
						v.version = Config.versions.dom;
						upgrades.push(v);
					}
				}
				
				if( upgrades.length ){
					this.POST('/apps/upgrade-sub-apps/', {data: upgrades})
						.then((data) => {
							if(data){
								this.setEditor(apps);
							}
						})
						.catch(er => console.error(er));
				} else {
					this.setEditor(apps);
				}
			},
			
			initApps({apps, settings, translations, licenses}){
				this.$store.commit('SET_SETTINGS', settings);
				this.$store.commit('SET_TRANSLATIONS', translations);
				this.$store.commit('SET_LICENSES', licenses);
				if( !apps.length ) this.activateTab(1);
				
				this.checkVersions({
					Apps: toKV(apps.filter(d => d.type === 'app'), 'id'),
					Themes: toKV(apps.filter(d => d.type === 'theme'), 'id'),
					Doms: toKV(apps.filter(d => d.type === 'dom'), 'id')
				});
			},
			
			setEditor(v){
				this.Editor = v;
			},
			
			coApps(item){				
				return {
					app: item,
					theme: this.Editor.Themes[ item.value.theme ].value,
					dom: this.Editor.Doms[ item.value.dom ].value
				};
			},
					
			saveApp(d, type){
				this.$set(this.Editor[type], d.id, d);
			},
			
			removeApp(d, type){
				this.$delete(this.Editor[type], d.id);
			},
			
			changeAppLists(app, lists){
				this.Editor.Apps[app].value.lists = lists;
			}
		}
	}
	
</script>
