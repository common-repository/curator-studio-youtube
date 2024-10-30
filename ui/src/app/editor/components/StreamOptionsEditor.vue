<template>
	<div class="box pa-none bra-sm clipped">
		<div class="pa-sm pl-normal pr-normal bg-secondary tw-semibold h6 color-shadea3 d-flex jc-between ai-center cursor-pointer opacity-075" @click="toggleOpen">
			Settings <fa :icon="panelIcon"></fa>
		</div>
		<div class="pa-normal" :class="{'d-none': !open}">
			<form @submit="onSubmit">
				<Editor eid="esm-stream" peid="null"></Editor>
				<div class="mt-normal buttons">
					<button class="button primary"><fa icon="check" :class="cP('mr-sm')"></fa>Save</button>
					<button class="button" @click="onReset"><fa icon="undo" :class="cP('mr-sm')"></fa>Cancel</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
	import {AbstractInput, InputMixin, TextInputMixin, SelectMixin, FormMixin} from '../../../libs/input';
	import {TextInput, SwitchInput, SelectInput, RichSelectInput} from '../../components/inputs';
	import {getDeepProp, Fence} from '../../../libs/bp';

	import {EditorSchema} from '../../instance/dom/';
	
	import BaseMixin from '../../mixins/BaseMixin';
	import {RendererMixin} from '../../elements';
	import PanelMixin from '../mixins/Panel.vue';
	
	const callComputer = (elem, computer, ...args) => {
		return (elem.local[computer] || computerNotDefined(computer))(...args);
	};
	
	const Components = {
		TextInput,
		SelectInput,
		RichSelectInput,
		SwitchInput
	};
		
	const GroupInputMixin = {
		mixins: [BaseMixin, AbstractInput, RendererMixin],
		
		inject: {
			conditionals: {
				type: Object,
				required: true
			},
			hasComments: {
				type: Function,
				required: true
			}
		},
		
		components: {
			...Components
		},
		
		methods: {
			getElement(id){
				return EditorSchema[id];
			},
						
			GroupInput(e, p){
				if( e.depends ){
					const r = Fence.process(
						e.depends.rule, 
						e.depends.key ? getDeepProp({local: this}, e.depends.key) : callComputer({local: this}, e.depends.compute)
					);
					if( !r ) return null;
				}
				return this.createElementWithProps(e, p);
			},
			
			fieldValueFromDependency({v}){
				return this.getFieldValue(v);
			},
			
			Input(e, p){
				return this.createElement({...e, props: e.config}, p);
			}
		}
	};
	
	const Editor = {
		mixins: [BaseMixin, RendererMixin, GroupInputMixin],
		components: {
			GroupInput: {
				name: 'GroupInput',
				mixins: [GroupInputMixin]
			}
		}
	};

	export default {
		inject: ['getList', 'getPane', 'getPaneList', 'COMMIT', 'updateStreamOptions'],
		mixins: [BaseMixin, FormMixin, PanelMixin],
		props: ['lid'],
		
		provide(){
			return {
				hasComments: this.hasComments,
				conditionals: this.conditionals
			};
		},
				
		data(){
			return {
				realtime: 0,
				open: false
			};
		},
		
		computed: {
			edit(){
				return this.getEditorData();
			},
			
			conditionals(){
				return {
					pagination: !this.edit.list.open
				};
			}
		},
		
		components: {
			Editor
		},
		
		methods: {		
			getSource(){
				return this.edit;
			},
			
			hasComments(){
				const {list, stream} = this.getPaneList(this.lid);
				if( !stream.sources || !stream.sources.length ) return false;
				const src = stream.sources[0];
				if( list.is_leaf || (src.source === 'facebook' && src.edge === 'albums')) return true;
			},
			
			getEditorData(){
				const {list, config, comments} = this.getPaneList(this.lid);
				
				return {
					list,
					config,
					comments: {
						list: comments.list,
						config: comments.config
					}
				};
			},
					
			updateList(lid, list, config, pid){
				this.COMMIT('UPDATE_LIST', {lid, list:config});
				this.COMMIT('UPDATE_LIST_LIST', {lid, pid, list});
			},
							
			submit(d){
				const lid = this.getPane(this.lid).list_id;
				const {comments, is_dynamic} = this.getList(lid);
											
				this.updateStreamOptions({lid: is_dynamic || lid, list:d})
					.then((data) => {
						if(data){
							const args = [lid, d.list, {
								config: d.config, 
								comments: {
									...comments, 
									list: d.comments.list, 
									config: d.comments.config
								}
							}, this.lid];
							
							this.COMMIT(`DELETE_CHAIN`, {start: this.lid, clear_self: false});
							
							this.updateList(...args);
							if( is_dynamic ) this.updateList(is_dynamic, ...args.slice(1, -1));
							
							this.COMMIT(`SET_PANE_CHILDREN`, {lid: this.lid, children: d.list.multiple ? {} : null});
						}
					})
					.catch(er => console.log(er));
			},
			
			reset(d){
				console.log(d);
			}
		}
	};
</script>
