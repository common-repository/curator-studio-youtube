<template>
	<div :class="{'pl-sm': Element.name}" :data-name="Element.key">
		<div v-if="Element.name" 
			class="cursor-move d-flex jc-between ai-center color-primary-hover" 
			style="border:1px solid rgba(0, 0, 0, .5);margin-top:-1px;padding:.15em .35em;"
			@mouseenter="mouseEnter" @mouseleave="mouseLeave">
			<div class="d-inline-flex ai-center">
				<fa icon="arrows-alt" style="margin-right:.35em;opacity:.7"></fa>
				<span class="h6" style="font-weight:400">{{ Element.name }}</span>
				<span class="small-text bg-shadeb2 color-shadea3 pl-sm pr-sm ml-sm" style="font-weight:400">{{ Element.type }}</span>
			</div>
			<div>
				<span v-if="isEditable" class="mr-sm lc-mr-none cursor-pointer opacity-075 opacity-1-hover" @click="selectElementForEdit(Element, cid)"><fa icon="pen"></fa></span>
				<span v-if="isHideable" class="mr-sm lc-mr-none cursor-pointer opacity-075 opacity-1-hover" @click="toggleVisibility(pkey, Element.key)">
					<fa :icon="visible ? 'eye' : 'eye-slash'"></fa>
				</span>
			</div>
		</div>
		<template v-if="Element.children">
			<template v-if="(Element.name || Element.editable) && !hasConditionalChildren">
				<Draggable :list="SchemaChanger.App.dom[Element.key].children" :move="checkMove">
					<Element v-for="c in elemChildren(Element)" 
						:elem="Elements[c]" :key="c" :pkey="Element.key" :visible="isVisible(Element, c)" :cid="Cid"></Element>
				</Draggable>
			</template>
			<template v-else>
				<div>
					<Element v-for="c in flatChildren(Element.children)" 
						:elem="Elements[c]" :key="c" :pkey="Element.key" :visible="isVisible(Element, c)" :cid="Cid"></Element>
				</div>
			</template>
		</template>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import Draggable from 'vuedraggable';
	import {removeFromArray} from '../../../libs/bp';
	
	export default {
		inject: ['SchemaChanger', 'selectElementForEdit', 'getTypedElement'],
		name: 'Element',
		
		props: {
			elem: {
				type: Object,
				required: true
			},
			visible: {
				type: Boolean,
				default: () => true 
			},
			pkey: {
				type: String
			},
			cid: {
				type: String
			}
		},
		
		mixins: [BaseMixin],
		
		components: {
			Draggable
		},
		
		computed: {
			Elements(){
				return this.SchemaChanger.Elements;
			},
			
			Cid(){
				return this.Element.components ? this.Element.eid : this.cid;
			},
			
			Element(){
				return this.elem.type && !this.elem.tag ? this.getTypedElement(this.cid, this.elem.type) : this.elem;
			},
			
			isHideable(){
				if( this.Element.hideable === false ) return false;
				return !this.Element.type;
			},
			
			isEditable(){
				const {schema, eschema, type} = this.Elements[this.elem.key];
				return (type || schema || eschema);
			},
			
			hasConditionalChildren(){
				return this.Element.children.some(e => Array.isArray(e));
			}
		},
		
		methods: {
			flatChildren(children){
				if( this.hasConditionalChildren ){
					return [].concat(...children.map(e => Array.isArray(e) ? [e[1], e[2]].filter(Boolean) : e));
				}
				return children;
			},
			
			elemChildren(e){
				const all_children = e.children;
				const shown_children = this.SchemaChanger.App.dom[e.key].children;
				return [...new Set([...shown_children, ...all_children])];
			},
			
			checkMove(a, b){
				this.SchemaChanger.setDirtyElement(this.Element.key);
				return a.draggedContext.element !== undefined;
			},
			
			isVisible(e, c){
				return this.SchemaChanger.App.dom[e.key].children.includes(c);
			},
						
			toggleVisibility(pkey, key){
				this.SchemaChanger.setDirtyElement(pkey);
				const children = this.SchemaChanger.App.dom[pkey].children;
				if( children.includes(key) ) removeFromArray(children, key);
				else children.push(key);
			},
			
			mouseEnter(e){
				if( this.SchemaChanger.Sheet.cssRules.length ){
					this.deleteRules();
				}
				const cl = this.cP(this.Element.key);
				
				this.SchemaChanger.Sheet.insertRule(`.${cl}{ position: relative; }`, 0);
				this.SchemaChanger.Sheet.insertRule(`.${cl}:before {
					border: 1px solid blue; 
					position: absolute;  
					content: " "; 
					z-index: 9999999;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
				}`, 1);
			},
			
			deleteRules(){
				this.SchemaChanger.Sheet.deleteRule(0);
				this.SchemaChanger.Sheet.deleteRule(0);
			},
			
			mouseLeave(){
				this.deleteRules();
			}
		}
	};
</script>
