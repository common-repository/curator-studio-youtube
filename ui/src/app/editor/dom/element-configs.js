import {Variables, designVariables} from '../../../libs/dom/base';
import {claschemaGroup, classSelector} from './utils';

const {spacing:{relative}} = designVariables(Variables);
const gaps = ['auto', ...Object.keys(relative), 'none'];

export default {
	'masonry__items': {
		tag: 'div',
		children: [
			{
				tag: 'TextInput',
				component: 'Input',
				classes: ['mb-normal'],
				config: {
					path: 'min_width.1',
					type: 'number',
					label: 'Item Min. Width',
					attrs: {
						min: 50
					},
					validations:[
						{n: 'min', v:50, msg: 'Must be at least 50'}
					]
				}
			},
			{
				tag: 'TextInput',
				component: 'Input',
				classes: ['mb-normal'],
				config: {
					path: 'max_width.1',
					type: 'number',
					label: 'Item Max. Width',
					attrs: {
						min: 50
					},
					validations:[
						{n: 'min', v:50, msg: 'Must be at least 50'}
					]
				}
			}
		] 
	},
	
	'basic-item': {
		tag: 'div',
		children: [
			{
				tag: 'SwitchInput',
				component: 'Input',
				classes: ['d-flex', 'ai-center', 'mb-normal'],
				config: {
					path: 'absolute',
					label: 'Show meta on hover',
					options: [
						{value: false, label: ''},
						{value: true, label: ''}
					]
				}
			}
		]
	},
	
	'long-item': {
		tag: 'div',
		children: [
			{
				tag: 'TextInput',
				component: 'Input',
				classes: ['mb-sm'],
				config: {
					path: 'media_width',
					type: 'number',
					label: 'Media Width',
					attrs: {
						min: 0
					},
					validations:[
						{n: 'min', v:0, msg: 'Must be at least 0'}
					]
				}
			},
			/*{
				tag: 'SwitchInput',
				component: 'Input',
				classes: ['d-flex', 'ai-center', 'mb-normal'],
				config: {
					path: 'shift',
					label: 'Shift',
					options: [
						{value: false, label: ''},
						{value: true, label: ''}
					]
				}
			}*/
		] 
	},
	
	'carousel__items': {
		tag: 'div',
		children: [
			{
				tag: 'TextInput',
				component: 'Input',
				classes: ['mb-sm'],
				config: {
					path: 'max_width.1',
					type: 'number',
					label: 'Item Max Width',
					attrs: {
						min: 50
					},
					validations:[
						{n: 'min', v:50, msg: 'Must be at least 50'}
					]
				}
			},
			{
				tag: 'SelectInput',
				component: 'Input',
				config: {
					path: 'gap',
					label: 'Gap',
					config: {
						allow_empty: false,
						select_key: 'value',
						multiple: false
					},
					options: gaps.map(e => ({value: e, label: e.toUpperCase()}))
				}
			}
		] 
	},
	
	'carousel__navigation': claschemaGroup('Buttons', [
		classSelector('classes.button.size', {
			name: 'Size',
			options: [['', 'Auto'], ['small', 'Small'], ['medium', 'Medium']]
		}),
		classSelector('classes.button.round', {
			name: 'Rounded',
			options: [['', 'No'], ['round', 'Yes']]
		}),
		classSelector('classes.button.color', {
			name: 'Color',
			options: [['', 'Auto'], ['primary', 'Primary'], ['secondary', 'Secondary'], ['text', 'Text']]
		})
	], {
		title: ['h4']
	}),
	
	'li-comments': claschemaGroup('Avatar', [
		classSelector('classes.avatar.round', {
			name: 'Rounded',
			options: [['', 'No'], ['round', 'Yes']]
		}),
	], {
		title: ['h4']
	}),

	'simple-list': {
		tag: 'div',
		children: [
			{
				tag: 'RichSelectInput',
				component: 'Input',
				config: {
					path: 'text-decoration',
					label: 'Text',
					config: {
						allow_empty: false,
						select_key: 'value',
						multiple: false
					},
					options: [
						{value: 'none', label: 'None'}, 
						{value: 'underline', label: 'Underline'}, 
						{value: 'line-through', label: 'Strike-through'}
					]
				}
			}
		]
	}	
};
