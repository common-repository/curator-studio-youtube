<template>
	<div class="relative lc">
		<Loading v-if="loading"></Loading>
		<div class="mb-normal">
			<AppEditor v-if="editor.item" :item="editor.item" :index="editor.index" :shortcode="appShortcode(editor.item)"
				@save-item="saveItem" 
				@cancel-edit="cancelEdit"
				@update-name="updateName">
			</AppEditor>
			<div v-else>
				<div v-for="(app, i) in Items" class="box d-flex jc-between ai-center mb-xs">
					<div class="d-flex ai-center flex-wrap">
						<h5 class="h6 tw-semibold mr-normal">{{ app.name }}</h5>
						<code class="h5">{{ appShortcode( app ) }}</code>
					</div>
					<div>
						<button class="button mr-sm" @click="editItem(i)">
							<fa icon="pen"></fa>
						</button>
						<button class="button error" @click="removeItem(i)"><fa icon="trash"></fa></button>
					</div>
				</div>
				<div class="mb-sm mt-md tw-semibold">
					<button class="button secondary mr-sm" @click="addApp"><fa icon="plus" :class="cP('mr-sm')"></fa>Add Streams</button>
					<button v-if="Config.apps.singles" class="button secondary" @click="addApp($event, true)"><fa icon="plus" :class="cP('mr-sm')"></fa>Add Singles</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import BaseMixin from '../mixins/BaseMixin';
	import Loading from '../components/Loading.vue';

	import {createStreamList} from '../tree-helpers';

	import {Variables} from '../../libs/dom/base';
	import {mergeAutoColors} from '../../libs/dom/reusables/CSS';

	import {ListPropsMixin} from '../../libs/list/mixins';
	import {ListEditorMixin, putAtIndex, removeAtIndex} from '../../libs/list/editor';
	import {uuid, dc} from '../../libs/bp';

	import ApiMixin from '../mixins/ApiMixin';
	import Elements, {cloneElements} from '../instance/dom/index';
	import {nonEmptyValues} from './utils';
	
	import AppEditor from './AppEditor.vue';
	import Config from '../instance/config';
	
	const stream_list = (s) => {
		if( !s ) return [];
		return [
			{
				open: true,
				multiple: true,
				pagination: {
					per_page: 111
				},
				viewer: {
					mode: 0,
					preload: -2
				}
			},
			{
				List: 'simple-list'
			}
		];
	};
	
	const AppData = (singles) => {
		const root = uuid();
		const lists = {
			[root]: createStreamList([], 'external_id', ...stream_list(singles))
		};
		return {root, lists};
	};
	
	const extractDynamicEntityName = src => {
		if( !src ) return '';
		if( src.edge.endsWith('--shortcode') ){
			return `${src.entity}=""`;
		}
		return '';
	};
	
	export default{
		mixins: [BaseMixin, ListPropsMixin, ListEditorMixin, ApiMixin],
		inject: ['SchemaChanger'],
		
		components: {
			Loading,
			AppEditor
		},
		
		computed: {
			Config(){
				return Config;
			}
		},
			
		methods: {
			appShortcode( app ){
				const {id, value:{lists:{lists}}} = app;
				const attrs = [`app="${id}"`];
				
				for(const l of Object.values(lists).filter(Boolean)){
					const {meta, sources} = l.stream;
					if( meta ) attrs.push( extractDynamicEntityName(meta) );
					if( sources ) attrs.push( ...sources.map(extractDynamicEntityName).filter(Boolean) );
				}
				
				return `[curator-studio-${Config.platform} ${attrs.join(' ')}]`;
			},
			
			getDummyItem(){
				return {
					id: null,
					name: ''
				};
			},
			
			addApp(e, f){
				const app = {
					name: `App - ${uuid()}`,
					lists: AppData( f ),
					theme: {
						meta:{
							name: 'First Theme'
						},
						...mergeAutoColors(Variables)
					},
					dom: cloneElements(Elements)
				};
				
				this.POST('/apps/create/', {data:{app, versions: Config.versions}})
					.then((data) => {
						this.addItem({
							id: data.app, 
							name: app.name, 
							type: 'app', 
							version: Config.versions.app || null,
							value: {
								theme: data.theme,
								dom: data.dom,
								lists: app.lists
							}
						}, 'Apps');
						
						this.addItem({
							id: data.theme, 
							name: app.theme.name, 
							type: 'theme',
							version: Config.versions.theme || null,
							value: app.theme
						}, 'Themes');
						
						this.addItem({
							id: data.dom, 
							name: null, 
							type: 'dom', 
							version: Config.versions.dom || null,
							value: app.dom
						}, 'Doms');
					})
					.catch(er => {
						console.log(er);
					});
			},
			
			addItem(d, type){
				this.$emit('save-item', d, type);
				this.$nextTick(() => {
					this.editItem(this.Items.length-1);
				});
			},
			
			saveItem(d, i){},
			
			removeItem(i){
				if( !confirm('Do you really want to delete this?') ) return false;
				const item = this.Items[i];
				this.POST('/apps/remove/', {app_id: item.id})
					.then((data) => {
						this.$emit('remove-item', item, 'Apps');
					})
					.catch(er => console.error(er));
			},
			
			cancelEdit(){
				this.SchemaChanger.cancel();
				
				const {lists, panes} = this.$store.state.emodule;
				this.$emit(
					'change-lists', 
					this.editor.item.id, 
					{
						lists: Object.entries(lists).reduce((acc, cur) => cur[1] && !cur[1].is_dynamic ? Object.assign(acc, {[cur[0]]: cur[1]}) : acc, {}),
						root: panes[panes.rootLid].list_id
					}
				);
				this.resetEditor();
			},
			
			updateName(item){
				this.POST('/apps/update-name/', {app_id: item.id, data: item.name})
					.then((data) => {
					})
					.catch(er => console.error(er));
			}
		},
		
		watch: {
			Items(){
				//this.editItem(this.Items.length-1);
			}
		}
	};

</script>
