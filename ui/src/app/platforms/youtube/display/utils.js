const Links = {
	profile({external_id}){
		return `https://www.youtube.com/channel/${external_id}`;
	},
	
	item({external_id, type, extra}){
		if( type === 'playlist' ){
			return `https://www.youtube.com/playlist?list=${external_id}`;
		} else if( type === 'video' ){
			return `https://www.youtube.com/watch?v=${external_id}`;
		} else {
			return `https://www.youtube.com/watch?v=${extra.video_id}&lc=${external_id}`;
		}
	},
	
	writeComment({external_id}){
		return `https://www.youtube.com/watch?v=${external_id}#comments`;
	},
	
	subscribe({external_id}){
		return `https://www.youtube.com/channel/${external_id}?sub_confirmation=1`;
	},
	
	search(term){
		return `https://www.youtube.com/results?search_query=${ encodeURIComponent(term) }`;
	}
};

export {Links};
