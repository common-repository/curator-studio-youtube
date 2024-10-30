<template>
	<div>
		<div class="small-text d-none"><code>{{ item.id }} - {{ item.child_list }}</code></div>
		<div class="d-inline-flex">
			<text-input v-bind="schema.name"></text-input>
			<div class="attached ml-xs">
				<button class="button primary" @click="onSubmit" title="Save"><fa icon="check"></fa></button>
				<button class="button error" @click="onRemove" title="Delete"><fa icon="times"></fa></button>
			</div>
		</div>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {TextInputMixin, FormMixin} from '../../../libs/input';
	import {ListItemEditorMixin} from '../../../libs/list/editor';
	
	export default{
		mixins: [BaseMixin, FormMixin, ListItemEditorMixin],
		
		data(){
			return {
				schema: {
					name: {
						path: 'name',
						type: 'text'
					}
				}
			};
		},
		
		components: {
			'text-input': {
				mixins: [BaseMixin, TextInputMixin],
				template: `
					<div>
						<input :type="type" :value="value" @input="onChange" @blur="validate" class="input" placeholder="Enter..."/>
					</div>
				`
			}
		}
	};
</script>
