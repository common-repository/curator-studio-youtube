import BaseMixin from '../../mixins/BaseMixin';
import {InputMixin, TextInputMixin, SelectMixin, FormMixin} from '../../../libs/input';
import {TextInput, SwitchInput, SelectInput, RichSelectInput} from '../../components/inputs';

import {EditorSchema} from '../../instance/dom/';
import {RendererMixin} from '../../elements';
import ColorInput from './ColorPicker.vue';	

const TabMixin = {
	data(){
		return {
			activeTab: 0
		};
	},
	
	methods: {
		activateTab(tab){
			this.activeTab = tab;
		},
		
		isActiveTab(tab){
			return this.activeTab === tab;
		}
	}
};

const EditorMixin = {
	mixins: [BaseMixin, FormMixin, RendererMixin],
	props: ['selected'],
	inject: {
		SchemaChanger: 'SchemaChanger',
		Elements: {
			default: () => EditorSchema
		}
	},
	
	components: {
		TextInput,
		RichSelectInput,
		SelectInput,
		SwitchInput,
		ColorInput
	},
	
	methods: {
		Input(e, p){
			return this.createElement({...e, props: e.config}, p);
		}
	}
}

const Theme = {		
	mixins: [EditorMixin],
	
	methods: {
		getSource(){
			return this.SchemaChanger.ThemeValue;
		},
		
		setFieldValue(path, value){
			this.SchemaChanger.Dirty.Theme = true;
			this.setPathValue(this.source, path, value);
		}
	}
};

const Config = {
	mixins: [EditorMixin],
	
	methods: {
		getSource(){
			return this.SchemaChanger.Element.config;
		},
		
		setFieldValue(path, value){
			this.SchemaChanger.setDirtyElement();
			this.setPathValue(this.source, path, value);
		}
	}
};

const ClassEditor = {
	mixins: [Config],
		
	methods: {
		getSource(){
			return this.SchemaChanger.Element.eclasses;
		}
	}
};

export {TabMixin, Config, Theme, ClassEditor};
