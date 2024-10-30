<template>
	<div class="cs-element-editor">
		<div v-if="isMainView && chain.parent">
			<button class="button mt-sm small" @click="changePane($event, chain.parent)"><fa icon="angle-up" :class="cP('mr-sm')"></fa> Parent List</button>
		</div>
		<Element :elem="elem" :visible="true" :cid="cid" class="pl-none mt-sm mb-sm" style="user-select:none"></Element>
		<div v-if="isMainView && chain.child">
			<button class="button mb-sm small" @click="changePane($event, chain.child)"><fa icon="angle-down" :class="cP('mr-sm')"></fa> Child List</button>
		</div>
	</div>
</template>

<script>
	import Element from './Element.vue';
	import BaseMixin from '../../mixins/BaseMixin';
	
	export default {
		mixins: [BaseMixin],
		inject: ['SchemaChanger'],
		props: ['view'],
		
		provide(){
			return {
				getTypedElement: this.getTypedElement,
				selectElementForEdit: this.selectElementForEdit
			};
		},
		
		watch: {
			'state.panes'(n, o){
				if( !n[this.activePid] ){
					this.SchemaChanger.deSelectElement()
				}
			}
		},
		
		computed: {			
			isMainView(){
				return this.view === 'main';
			},
			
			activeLid(){
				if( !this.isMainView ) return null;
				
				if( this.SchemaChanger.Selected.lid )
					return this.SchemaChanger.Selected.lid;
				
				const {panes} = this.state;
				return panes[panes.rootLid].list_id;
			},
			
			state(){
				return this.SchemaChanger.Evue.state;
			},
			
			activePid(){
				if( !this.isMainView ) return null;
				
				if( this.SchemaChanger.Selected.pid )
					return this.SchemaChanger.Selected.pid;
				return this.state.panes.rootLid;
			},
			
			chain(){
				return {
					parent: this.state.panes[this.activePid].parent,
					child: this.getAChildPaneId()
				};
			},
			
			elem(){
				if( this.isMainView ){
					return this.state.lists[this.activeLid].list.open
					? this.SchemaChanger.Elements[ 'list-item' ]
					: this.getTypedElement(null, this.state.lists[this.activeLid].stream.sources ? 'List' : 'LightList')
				}
				return this.SchemaChanger.Elements[ this.view ]
			},
									
			cid(){
				return this.activeLid ? null : this.view;
			}
		},
		
		components: {
			Element
		},
				
		methods: {
			getTypedElement(cid, type){
				const {components} = cid ? this.SchemaChanger.App.dom[ cid ] : this.state.lists[this.activeLid];
				return this.SchemaChanger.Elements[ components[type] ];
			},
			
			selectElementForEdit(elem, cid){
				this.SchemaChanger.selectElement({lid: this.activeLid, pid: this.activePid, eid: elem.eid, cid});
			},
			
			getAChildPaneId(){
				const {clid, children} = this.state.panes[this.activePid];
				if( clid ) return clid;
				if( children ) return Object.values(children)[0];
				return null;
			},
			
			changePane(e, pid){
				e.preventDefault();
				const {list_id} = this.state.panes[pid];
				const lid = this.state.lists[list_id].is_dynamic || list_id;
				//this.SchemaChanger.selectElement({lid, pid, eid: this.elem.eid, cid: this.cid});
				this.SchemaChanger.Selected = {eid: null, cid: null, lid, pid};
			}
		}
	};
</script>
