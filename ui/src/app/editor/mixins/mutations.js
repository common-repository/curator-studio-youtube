export default {
inject: {
		updateStreams: {
			type: Function,
			required: true
		},
		changeStreams: {
			type: Function,
			required: true
		},
		getState: {
			type: Function,
			required: true
		},
		COMMIT: {
			type: Function,
			required: true
		},
		DISPATCH: {
			type: Function,
			required: true
		}
	}
};
