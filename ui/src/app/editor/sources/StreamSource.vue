<template>
	<div class="ba-1-border pa-md bra-md">
		<h6 class="h6 tw-bold mb-xs">{{ src.title }}</h6>
		<div v-if="error" class="bg-error box pa-sm color-shadea3 mt-sm mb-sm tw-semibold" v-html="error.message"></div>
		<div v-if="src.tip" class="bg-secondary box pa-sm color-shadea3 mt-sm mb-sm tw-semibold" v-html="src.tip"></div>
		<div class="cols jc-between">
			<div class="col">
				<Fields :schema="schema[0]" eid="root" :peid="null"></Fields>
				<div v-if="schema[1]" class="mt-xs">
					<a href="#" @click.prevent="advanced = !advanced" class="color-text">
						<fa :icon="advanced ? 'times' : 'plus'"></fa> More options
					</a>
				</div>
				<Fields v-if="advanced && schema[1]" :schema="schema[1]" eid="root" :peid="null"></Fields>
			</div>
			<div class="col flex-none">
				<span class="label d-none-sm">&nbsp;</span>
				<div class="buttons attached">
					<button class="button" @click="onReset" title="Cancel"><fa icon="undo"></fa></button>
					<button class="button primary" @click="onSubmit" title="Save"><fa icon="check"></fa></button>
					<button v-if="item.dynamic !== 1" class="button error" @click="handleRemoveCall" title="Delete"><fa icon="times"></fa></button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {FormMixin} from '../../../libs/input';
	import {ListItemEditorMixin} from '../../../libs/list/editor';
	import {TextInput, SwitchInput, DateInput, SelectInput} from '../../components/inputs';
	import {RendererMixin, normalizeElements} from '../../elements';
	
	import {EntityInputMixin} from '../../instance/sources/mixins';
	
	const {Elements, ...injects} = RendererMixin.inject;
	
	const Fields = {
		mixins: [BaseMixin, {...RendererMixin, inject:injects}],
		props: {
			schema: {
				type: Array,
				required: true,
			}
		},
				
		computed: {
			Elements(){
				return normalizeElements({
					elements: {
						root: {
							tag: 'div',
							classes: ['cols', 'gap-l', 'cols--margin-none'],
							children: this.schema
						}
					}
				}, true);
			}
		},
		
		components: {
			EntityInput: {
				mixins: [TextInput, EntityInputMixin]
			},
			TextInput,
			SwitchInput,
			DateInput,
			SelectInput
		},
		
		methods: {
			Input(e, p){
				return this.createElement({...e, props: e.config}, p);
			}
		}
	};
	
	export default {
		mixins: [BaseMixin, FormMixin, ListItemEditorMixin],
		props: {
			src: {
				type: Object,
				required: true,
			},
			error: {
				type: Object,
				default: () => null
			}
		},
		
		data(){
			return {
				advanced: false
			};
		},
				
		computed:{
			schema(){
				if( !this.item.dynamic )
					return this.src.schema;
				
				const schema = this.src.schema;
				const s0 = [...schema[0]];
				const {config, ...rest} = s0[0];
				
				s0[0] = {config: {...config, attrs: {readonly: true}}, ...rest};
				return [s0, ...schema.slice(1)];
			}
		},
				
		components: {
			Fields
		},
		
		methods: {
			handleRemoveCall(){
				if( !confirm('Do you really want to delete this?') ) return false;
				this.onRemove();
			}
		}
	};
</script>
