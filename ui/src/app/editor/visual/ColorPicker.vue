<template>
	<div class="relative">
		<div class="d-flex ai-center">
			<span class="label mr-sm mb-none">{{ label }}</span>
			<div v-if="value !== 'auto'" 
				style="width:3em;height:1.5em" 
				:style="{background: value}" 
				class="cursor-pointer ba-1 mr-normal" 
				@click="togglePicker" 
				@blur="hidePicker">
			</div>
			<label v-if="autoable" class="d-flex ai-center">
				<input type="checkbox" class="mr-xs" :checked="value === 'auto'" @change="changeAuto"/> Auto
			</label>
		</div>
		<Chrome v-if="picker" :value="value" @input="updateColor" class="box absolute" style="top:1.85em;z-index:100"></Chrome>
	</div>
</template>

<script>
	import {Chrome} from 'vue-color';
	import {InputMixin} from '../../../libs/input';
	import BaseMixin from '../../mixins/BaseMixin';
	import {SwitchInput} from '../../components/inputs';

	export default {
		mixins: [BaseMixin, InputMixin],
		
		props: {
			label: {
				type: String,
				required: true
			},
			autoable: {
				type: Boolean,
				default: () => false
			}
		},
		
		data(){
			return {
				picker: false
			};
		},
		
		components: {
			Chrome,
			SwitchInput
		},
		
		methods: {
			togglePicker(e){
				e.stopPropagation();
				this.picker = !this.picker;
			},
			
			hidePicker(){
				this.picker = false;
			},
			
			updateColor(e){
				const {h, s, l, a} = e.hsl;
				this.changeValue(`hsla(${h}, ${s*100}%, ${l*100}%, ${a})`);
			},
			
			changeAuto(){
				this.hidePicker();
				if( this.value === 'auto' ){
					this.changeValue(`hsla(0, 0%, 100%, 1)`);
				} else {
					this.changeValue(`auto`);
				}
			}
		}
	}
</script>
