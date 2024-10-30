import ElementConfigs from '../../../editor/dom/element-configs';
import {Schema, Claschemas} from '../../../editor/dom/editor';
import EditorExtras from '../../../pro/dom/editor';

Object.assign(Schema.elements, ElementConfigs, EditorExtras);

for(const [k, v] of Object.entries(Claschemas)){
	Schema.elements[k] = v;
}

export default Schema;
