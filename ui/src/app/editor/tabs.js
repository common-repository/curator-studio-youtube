import Settings from './Settings.vue';
import Translations from './Translations.vue';
import ProTabs from './tabs.pro.js';

export default {
	tabs: [
		['Settings', 'Settings'],
		['Translations', 'Translations'],
		...(ProTabs.tabs || [])
	],
	components: {Settings, Translations, ...ProTabs.components}
};
