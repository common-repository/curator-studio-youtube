import {ViewerMixin as BaseViewerMixin, ViewerItemMixin} from '../../../../display/viewers/mixins.js';
import {VideoPlayer as VideoPlayerMixin, YouTubePlayer} from '../../../../display/viewers/players.js';

import ViewerMixinPro from '../../../../pro/display/viewers/mixins';

const ViewerMixin = {
	mixins: [BaseViewerMixin, ViewerMixinPro]
};

const VideoPlayer = {
	mixins: [VideoPlayerMixin],
		
	methods: {
		getPlayerType(){
			return YouTubePlayer;
		}
	}
};

export {ViewerMixin, ViewerItemMixin, VideoPlayer};
