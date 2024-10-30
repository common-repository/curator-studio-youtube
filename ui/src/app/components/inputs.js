import {TextInputMixin, SelectMixin, SwitchMixin} from '../../libs/input';
import {createListData} from '../../libs/list/utils';
import BaseMixin from '../mixins/BaseMixin';
import Config from '../instance/config';

import Tooltip from './Tooltip.vue';
import Datepicker from 'vuejs-datepicker';

const BaseInputMixin = {
	mixins: [BaseMixin],
	props: {
		label: {
			type: String,
			required: true
		},
		tip: {
			type: [Object, String]
		},
		attrs: {
			type: Object,
			default: () => ({})
		}
	},
	
	data(){
		return {
			tip_switch: false 
		};
	},
	
	components: {
		Tooltip
	},
	
	computed: {
		toolTip(){
			const tip = this.tip || (this.config && this.config.tip);
			if( !tip ) return null;
			if( typeof tip === 'object' ){
				return {
					...tip,
					trigger: 'manual',
					show: this.tip_switch
				};
			} else {
				return tip;
			}
		}
	},
		
	methods: {
		toggleTip(dir){
			this.tip_switch = dir === undefined ? !this.tip_switch : dir;
		}
	}
};

const DateInput = {
	mixins: [BaseInputMixin, TextInputMixin],
	
	components: {
		Datepicker
	},
			
	computed: {
		isRelativeTime(){
			return Array.isArray(this.value);
		},
		
		timeTip(){
			if( this.isRelativeTime ) return 'Switch to absolute date format. (Exact date)';
			return 'Switch to relative date format. (Time ago)';
		},
		
		units(){
			return Config.date_range_units;
		}
	},
	
	template: `
		<div>
			<label @click.prevent>
				<span class="label">
					{{ label }} 
					<span v-if="toolTip" v-tooltip="toolTip" class="ml-xs cursor-pointer" @mouseenter="toggleTip(true)" @click="toggleTip(false)">
						<fa icon="info-circle" style="font-size: 1.15em"></fa>
					</span>
				</span>
				<div class="d-flex">
					<button class="button square mr-sm" v-tooltip="timeTip" @click="switchMode">
						<fa icon="toggle-on"></fa>
					</button>
					<Datepicker v-if="!isRelativeTime" :value="value" @input="changeValue" format="yyyy MMM dd" :clear-button="true" :input-class="cP('input')" v-bind="attrs"></Datepicker>
					<div v-else class="d-flex">
						<input class="input mr-sm" :value="value[0]" @input="changeRelativeValue($event, 0)" type="number" min="0" placeholder="0" style="width:5em"/>
						<span class="select mr-xs">
							<select @change="changeRelativeValue($event, 1)">
								<option v-for="u in units" :value="u[0]" :selected="u[0] === value[1]">{{ u[1] }}</option>
							</select>
						</span>
						ago
					</div>
				</div>
				<div>
					<div class="help error" v-for="e in errors">{{ e.msg }}</div>
				</div>
			</label>
		</div>
	`,
	
	methods: {
		changeValue(value){
			this.setPristine(false);
			this.setFieldValue(this.path, value);
		},
		
		changeRelativeValue(e, i){
			const v = [...this.value];
			v[i] = i ? e.target.value : parseFloat(e.target.value);
			this.changeValue(v);
		},
		
		switchMode(){
			if( this.isRelativeTime ) this.changeValue(null);
			else this.changeValue([0, Config.date_range_units[0][0]]);
		}
	}
};

const TextInput = {
	mixins: [BaseInputMixin, TextInputMixin],
		
	template: 	`
		<div>
			<label>
				<span class="label">
					{{ label }} 
					<span v-if="toolTip" v-tooltip="toolTip" class="ml-xs cursor-pointer" @mouseenter="toggleTip(true)" @click="toggleTip(false)">
						<fa icon="info-circle" style="font-size: 1.15em"></fa>
					</span>
				</span>
				<input :type="type" :value="value" @input="onChange" @blur="validate" class="input" placeholder="Enter..." v-bind="attrs"/>
				<div>
					<div class="help error" v-for="e in errors">{{ e.msg }}</div>
				</div>
			</label>
		</div>
	`	
};

const SwitchInput = {
	mixins: [BaseInputMixin, SwitchMixin],
	
	template: 	`
		<div>
			<span class="label">
				{{ label }} 
				<span v-if="toolTip" v-tooltip="toolTip" class="ml-xs cursor-pointer" @mouseenter="toggleTip(true)" @click="toggleTip(false)">
					<fa icon="info-circle" style="font-size: 1.15em"></fa>
				</span>
			</span>
			<label class="checkbox">
				<input type="checkbox" :checked="value" @change="onChange"/>
				<span class="ml-xs">{{ checkedLabel }}</span>
			</label>
		</div>
	`
};

const NativeSelectMixin = {
	props: {
		type: {
			type: String,
			default: () => 'text'
		}
	},
	
	methods: {
		onItemSelect({target: {selectedOptions}}, uid){
			const caster = this.type === 'number' ? Number : String;
			this.changeValue([...selectedOptions].map(o => caster(o.value)));
		},
		
		clearSelection(){}
	}
};


const SelectInput = {
	mixins: [BaseInputMixin, SelectMixin, NativeSelectMixin],
		
	data(){
		return {
			d: createListData(this.config)
		};
	},
			
	template: `
		<div>
			<label>
				<span class="label">
					{{ label }} 
					<span v-if="toolTip" v-tooltip="toolTip" class="ml-xs cursor-pointer" @mouseenter="toggleTip(true)" @click="toggleTip(false)">
						<fa icon="info-circle" style="font-size: 1.15em"></fa>
					</span>
				</span>
				<span class="select">
					<select @change="onItemSelect" :multiple="multiple">
						<option v-for="it in itemProps" :value="it.selected_value" :selected="it.is_selected">{{ Items[it.i].label }}</option>
					</select>
				</span>
				<div>
					<div class="help error" v-for="e in errors">{{ e.msg }}</div>
				</div>
			</label>
		</div>
	`,

};


const RichSelectInput = {
	mixins: [BaseInputMixin, SelectMixin],
		
	data(){
		return {
			d: createListData(this.config)
		};
	},
			
	template: `
		<div>
			<label>
				<span class="label">{{ label }}</span>
			</label>
			<div class="buttons attached">
				<button v-for="it in itemProps" @click="onItemSelect($event, it)" class="button" :class="{primary: it.is_selected}">{{ Items[it.i].label }}</button>
			</div>
			<div>
				<div class="help error" v-for="e in errors">{{ e.msg }}</div>
			</div>
		</div>
	`,

};


export {TextInput, SwitchInput, SelectInput, RichSelectInput, DateInput};
