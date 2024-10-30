import {expandPaths, createSource, createSearchSource} from './utils';

const expandables = [
	{
		title: 'Channel',
		fields: {
			source: 'youtube',
			edge: 'profile',
			entity: ''
		},
		type: 'profile',
		select_key: 'id',
		children: [
			['Videos', [{...createSource('videos'), sortby: 'date'}]]
		],
		schema: {
			masks: ['channel'],
			label: 'Enter channel ID or URL',
			entity: 'Channel ID'
		}
	},
	{
		title: 'A single video',
		fields: {
			source: 'youtube',
			edge: 'video',
			entity: ''
		},
		type: 'item',
		select_key: 'external_id',
		schema: {
			masks: ['video'],
			label: 'Enter video ID or URL',
			entity: 'Video ID'
		}
	},
	{
		title: 'Videos of a channel',
		fields: {...createSource('videos'), sortby: 'date'},
		type: 'item',
		select_key: 'external_id',
		schema: {
			fields: [['limit']],
			masks: ['channel'],
			label: 'Enter channel ID or URL',
			entity: 'Channel ID'
		}
	},
	{
		title: 'Videos of a playlist',
		fields: createSource('playlist-videos'),
		type: 'item',
		select_key: 'external_id',
		schema: {
			fields: [['limit']],
			masks: ['playlist'],
			label: 'Enter playlist, ID or URL',
			entity: 'Playlist ID'
		}
	}
];

export default [
	...expandPaths(
		expandables,
		[
			['--shortcode', ' from shortcode attribute', 'Enter shortcode attribute name']
		]
	)
];

export const commentStream = [{source: 'youtube', edge: 'comments', entity: ''}];
