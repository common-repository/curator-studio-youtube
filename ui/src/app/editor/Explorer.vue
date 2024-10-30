<script>
	import PaneEditorMixin from './mixins/PaneEditor.vue';
	import SimpleLightListItems from './components/SimpleLightListItems.vue';

	import ExplorerMixin from '../components/Explorer.vue';
	import Loading from '../components/Loading.vue';
	
	import Panes from '../instance/display/panes/panes';
	import Lists from '../instance/display/lists/lists';
	
	Lists.LightLists.SimpleLightList.components.LightListItems = SimpleLightListItems;
	
	if(Lists.Lists.Sequence){
		Lists.Lists.Sequence.components.ListItems.components.SimplePane = () => import('../pro/display/panes/SimplePaneEditor.vue');
	}
	
	export default {
		mixins: [ExplorerMixin],
		props: {
			instance: {
				type: Object,
				required: true
			},
			
			module:{
				type: String,
				default: () => 'module-1'
			}
		},
		
		provide(){
			return {
				updateStreams: this.updateStreams,
				changeStreams: this.changeStreams,
				mergeListList: this.mergeListList,
				updateStreamOptions: this.updateStreamOptions
			};
		},
		
		components: {
			SimplePane: {
				name: 'SimplePane',
				mixins: [Panes.SimplePane, PaneEditorMixin]
			}
		},		
		
		methods: {			
			refreshItems({d, force_refresh}){
				const {pane, stream} = this.prepareStream(d.lid);
				if( !stream.sources ) return;
				
				this.POST('/stream/update/', {app_id: this.instance.app.id, args:d, stream, lid: pane.list_id, refresh: force_refresh})
					.then((data) => {
						if( data.errors ) this.COMMIT(`ADD_STREAM_ERRORS`, {lid: pane.list_id, errors: data.errors});
						this.COMMIT(`CHANGE_LIST_META`, {lid: pane.list_id, meta: data.meta});
						this.COMMIT(`CHANGE_LIST_ITEMS`, {lid: pane.list_id, items: data.items});
						this.COMMIT(`UPDATE_PAGINATION`, {lid: d.lid, pagination: data.meta.pagination});
						this.checkPreload(pane, d.lid, data, d);
					})
					.catch(er => console.log(er));
			},
						
			updateStreams(lists){
				return this.POST('/lists/update/', {app_id: this.instance.app.id, lists});
			},
			
			changeStreams(lists, root){
				return this.POST('/lists/change/', {app_id: this.instance.app.id, lists: {lists, root}});
			},
			
			mergeListList(lid, list){
				return this.POST('/lists/merge-list/', {app_id: this.instance.app.id, data: {lid, list}});
			},
						
			updateStreamOptions(data){
				return this.POST('/stream/update-options/', {app_id: this.instance.app.id, data});
			}
		}
	};
</script>
