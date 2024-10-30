import {cloneElements, normalizeStoredElements} from '../../../editor/dom/utils';
import {normalizeElements} from '../../../elements';
import {dc} from '../../../../libs/bp';

import Schema from './editor';

import _Elements from '../../../editor/dom/index';
import Items from '../../../editor/dom/items';
import ItemComponents from '../../../editor/dom/item-components';
import Viewer from '../../../editor/dom/viewer';

const Elements = dc(_Elements);

Object.assign(Elements.elements, {
	...Items,
	...ItemComponents,
	...Viewer
});

const Elements2 = normalizeStoredElements(dc(Elements), Schema);
const EditorSchema = normalizeElements(Schema, true);

const Views = [
	{name: 'Main', value: 'main', component: 'Explorer'}
];

export default Elements2;
export {cloneElements, EditorSchema, Views};
