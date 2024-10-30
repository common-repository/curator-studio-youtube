<template>
	<div class="themespace" :class="'themespace-'+themeId">
		<div class="instance" :id="'instance-'+instanceId">
			<div class="relative">
				<div v-if="Items">
					<component :is="Component" :eid="list.components.Item" :peid="null" 
						v-for="(it, i) in Items" :key="it.id" v-bind="itemProps[i]" :it="it" :highlightable="false" class="sub-col card">
					</component>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Dom from '../mixins/Dom';
	import Items from '../instance/display/items/items.js';
	import {getDeepProp} from '../../libs/bp';
			
	export default {
		mixins: [Dom],
		
		provide(){
			const s = this;
			return {
				handleItemSelect: this.handleItemSelect,
				getD: () => s.list.list,
				getCurrentList: () => s.list,
				getCurrentPane: () => ({list_id: s.instance.app.value.lists.root })
			};
		},
		
		components: {
			...Items
		},
		
		data(){
			return {
				instance: null,
				Items: null
			};
		},
		
		computed: {
			list(){
				const {lists, root} = this.instance.app.value.lists;
				return lists[ root ];
			},
			
			Component(){
				return this.Elements[ this.list.components.Item ].component;
			},
			
			itemProps(){
				const {select_key, disabled, selected, selectable} = this.list.list;
				return this.Items.map((d, i) => {
					const selected_value = select_key ? getDeepProp(d, select_key) : d;
					return {
						i, 
						is_selected: selected.includes(selected_value), 
						is_disabled: disabled.includes(selected_value),
						selected_value,
						//select_key,
						selectable
					};
				});
			}
		},
		
		mounted(){
			this.init();
		},
		
		methods: {
			handleItemSelect(ctx){
				const {selected_value, is_selected} = ctx;
				if( !is_selected ) this.list.list.selected.push(selected_value);
			},
			
			init(){
				const root = this.instance.app.value.lists.root;
								
				this.POST('/stream/', {app_id: this.instance.app.id, stream: this.list.stream, lid: root, args: this.list.list})
					.then((data) => {
						this.Items = data.items;
					})
					.catch(er => console.log(er));
			}
		}
	};
</script>
