export default {
	meta: {
		followers: 'subscribers',
		videos: 'videos',
		views: 'views'
	},
	list: {
		
	},
	pagination: {
		first: 'First',
		prev: 'Previous',
		next: 'Next',
		last: 'Last'
	},
	item: {
		likes: 'likes',
		dislikes: 'dislikes',
		comments: 'comments',
		replies: 'replies',
		videos: 'videos',
		playlists: 'playlists',
		views: 'views',
		write_a_comment: 'Write a comment...',
		less: 'Less',
		more: 'More',
		live: 'Live'
	},
	numbers: {
		k: 'K',
		m: 'M',
		b: 'B'
	},
	time: {
		format: 'MMM DD, YYYY [at] HH:mm',
		short_format: 'MMM D, HH:mm'
	},
	extra: {
		loading: 'Loading...',
		close: 'Close'
	}
};

const i18nMeta = {
	meta: {
		__label: 'Meta'
	},
	list: {
		__label: 'List'
	},
	pagination: {
		__label: 'Pagination'
	},
	item: {
		__label: 'Item'
	},
	numbers: {
		__label: 'Numbers'
	},
	time: {
		__label: 'Time',
		format: {
			label: 'Format',
			tip: {
				content: 'All <a href="https://day.js.org/docs/en/display/format" target="_blank">Day.js</a> formats are supported.'
			}
		},
		short_format: {
			label: 'Short Format',
			tip: {
				content: 'All <a href="https://day.js.org/docs/en/display/format" target="_blank">Day.js</a> formats are supported.'
			}
		}
	},
	extra: {
		__label: 'Extra'
	}
}; 

export {i18nMeta};
