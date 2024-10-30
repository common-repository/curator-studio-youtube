<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {createListData} from '../../../libs/list/utils';
	import {cloneLists, addGroup} from '../utils';
	import Sources from '../sources/Sources.vue';
	import MutationsMixin from './mutations';
	
	export default{
		mixins: [BaseMixin, MutationsMixin],
		props: {
			lid: {
				type: String,
				required: true
			},
			list: {
				type: Object,
				required: true
			},
			pane: {
				type: Object,
				required: true
			}
		},
				
		components: {
			'stream-sources': Sources
		},
		
		data(){
			return {
				sourceList: createListData({select_key: 'hash'})
			};
		},
			
		methods: {
			getSources(){
				if( this.list.stream.meta )
					return [this.list.stream.meta];
				return this.list.stream.sources;
			},
			
			getOriginalSources(){
				if( this.list.stream.meta )
					return this.list.stream.meta;
				return this.list.stream.sources;
			},
			
			addGroup(){
				const state = this.getState();
				const nlists = cloneLists(state);
				const {lists, list_id, itemsList, root} = addGroup(state.panes, nlists, this.lid);
							
				this.changeStreams(lists, root)
					.then((data) => {
						if(data){
							this.DISPATCH(`ADD_GROUP`, {clid: this.lid, list_id, itemsList});
						}
					})
					.catch(er => {
						console.log(er);
					});
			}
		}
	};
</script>
