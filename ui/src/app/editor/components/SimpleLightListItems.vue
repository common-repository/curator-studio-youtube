<template>
	<div>
		<div class="tabs tw-semibold lightlist d-flex">
				<Draggable v-model="draggables" @start="dragging = true" @end="dragging = false">
					<div v-for="(it, i) in Items" class="tab d-flex ai-center" :class="{'active': itemProps[i].is_selected}" style="cursor:move">
						<group-item v-if="itemProps[i].is_selected" :item="it" :index="i" 
							@save-item="saveItem" 
							@remove-item="removeItem"
							@cancel-edit="cancelEdit">
						</group-item>
						<div v-else @click="onItemSelect($event, itemProps[i])">{{ it.name }}</div>
					</div>
				</Draggable>
				<div class="tab d-flex ai-center" @click="addItem">+Add New</div>
		</div>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {ListItemsMixin} from '../../../libs/list/mixins';
	import LightListEditorMixin from '../mixins/LightListEditor.vue';
	import Draggable from 'vuedraggable';
	
	export default{
		mixins: [ListItemsMixin, LightListEditorMixin],
		
		components: {
			Draggable: {
				mixins: [BaseMixin, Draggable]				
			}
		},
		
		computed: {
			draggables: {
				get(){
					return this.Items;
				},
				
				set( items ){
					this.saveItems(items);
				}
			}
		}
	};
</script>
