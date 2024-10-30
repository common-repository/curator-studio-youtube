const EntityInputMixin = {
	methods: {
		passThroughMasks(value){
			if( this.masks ){
				if( this.masks[0] === 'channel' ){
					const matches = value.match(/^(?:(http|https):\/\/[a-zA-Z-]*\.{0,1}[a-zA-Z-]{3,}\.[a-z]{2,})\/channel\/([a-zA-Z0-9-_]{3,})$/);
					if( matches && matches[2] ){
						return matches[2];
					}
				} else if( this.masks[0] === 'video' ){
					const matches = value.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
					if( matches && matches[1] ){
						return matches[1];
					}
				} else if( this.masks[0] === 'playlist' ){
					const matches = value.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
					if( matches && matches[2] ){
						return matches[2];
					}
				}
			}
			return value;
		}
	}
};

export {EntityInputMixin};
