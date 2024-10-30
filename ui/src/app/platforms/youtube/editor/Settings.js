const SettingsMixin = {
	methods: {
		extraSchema(schema){
			schema.root.children.unshift('root-0');
			return {
				...schema,
				'root-0': {
					tag: 'div',
					children: ['root-0-0'],
				},
				'root-0-0': {
					tag: 'TextInput',
					component: 'Input',
					classes: ['mb-normal'],
					config: {
						path: 'creds.youtube.key',
						type: 'text',
						label: 'Enter API Key',
						tip: {
							content: 'See <a href="https://curatorstudio.io/docs/create-youtube-api-key" target="_blank">instructions here</a> to create your own API Key at Google.'
						},
						validations: [
							{n:'onlyspace', not: true, msg:'Cannot be empty'}
						]
					}
				}
			};
		}
	}
};

const GroupInputMixin = {};

export {SettingsMixin, GroupInputMixin};
