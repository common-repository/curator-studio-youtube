import Lists from '../lists/lists';
import {SimplePane as BaseSimplePane} from '../../../../display/panes/panes';

const SimplePane = {
	name: 'SimplePane',
	mixins: [BaseSimplePane],
	
	components: {
		...Lists.Lists, 
		...Lists.LightLists
	}
};

export default {SimplePane};
