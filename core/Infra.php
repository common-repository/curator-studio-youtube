<?php
namespace csyoutube\core;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

use csyoutube\core\Store;
use csyoutube\core\Streamer;
use csyoutube\core\CuratorList;
use csyoutube\utils\Utils;

class Infra{
	function __construct(){
		$this->Store = new Store();
		$this->Config = null;
		$this->platform = $this->Store->platform;
		
		if (! wp_next_scheduled ( 'cstudio_remove_stale_sources' )) {
			wp_schedule_event( time(), 'daily', 'cstudio_remove_stale_sources' );
		}
		
		add_action('cstudio_remove_stale_sources', function(){
			$this->Store->removeStaleSources();
		});
			
		$this->L = null;
		$this->ids = [];
		
		return $this;
	}
	
	function setIds($app=null, $lid=null){
		$this->ids = [
			'lid' => $lid,
			'app' => $app
		];
	}
	
	function getConfig(){
		if( !$this->Config ){
			$this->Config = $this->Store->getSettings();
		}
		return $this->Config;
	}
	
	function newList(){
		return new CuratorList($this->Store, $this->getConfig());
	}
		
	function getStreamer(){
		if( !property_exists($this, 'Streamer') ){
			$this->Streamer = new Streamer(
				$this->Store,
				$this->getConfig()
			);
		}
		return $this->Streamer;
	}
	
	function getApps($req){
		return Utils::create_api_response(
			$this->Store->getApps()
		);
	}
	
	function getEditorData(){
		return Utils::create_api_response(
			Utils::apply_filters('editor_data', [
				'apps' => $this->Store->getApps(),
				'settings' => $this->Store->getSettings(),
				'translations' => $this->Store->getTranslations()
			])
		);
	}
	
	function saveKeyValue($req){
		$payload = json_decode($req->get_body(), true);
		$this->Store->saveKeyValue( $payload['key'], $payload['data'] );
		return Utils::create_api_response(true, ['message' => 'Changes updated successfully']);
	}
		
	function debug($req){
		$payload = json_decode($req->get_body(), true);
		if( !$payload ) return Utils::create_api_message('Invalid data', true);
		
		if( $payload['action'] === 'clear-cache' ){
			$this->Store->removePlatformSources();
			return Utils::create_api_response(true, ['message' => 'Cache cleared successfully']);
		
		} else if( $payload['action'] === 'delete-data' ){
			$this->Store->removeApps();
			return Utils::create_api_response(true, ['message' => 'Data deleted successfully']);
		}
	}
	
	function createApp($req){
		$data = json_decode($req->get_body(), true)['data'];
		return $this->Store->createApp( $data['app'], $data['versions'] );
	}
	
	function updateAppName($req){
		$payload = json_decode($req->get_body(), true);
		return $this->Store->updateAppName($payload['app_id'], $payload['data']);
	}
	
	function updateSubApps($req){
		$payload = json_decode($req->get_body(), true);
		$re = $this->Store->getAppValue($payload['app_id']);
		
		if( !$re ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
		
		$data = $payload['data'];
		return $this->Store->updateSubApps($re, $payload['app_id'], $data);
	}
	
	function upgradeSubApps($req){
		$payload = json_decode($req->get_body(), true);
		return $this->Store->upgradeSubApps($payload['data']);
	}
		
	function removeApp($req){
		$payload = json_decode($req->get_body(), true);
		$re = $this->Store->getAppValue($payload['app_id']);
		
		if( !$re ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
		
		return $this->Store->removeApp($re, $payload['app_id']);
	}
	
	function getL(){
		if( $this->L ) return $this->L;
		$app = $this->Store->getAppValue($this->ids['app']);
		if( !$app ) wp_send_json(0);
		$list = Utils::get($app['lists']['lists'], $this->ids['lid']);
		if( !$list ) wp_send_json(0);
		$this->L = $list;
		return $this->L;
	}
	
	function nonApiStream(){
		$data = Utils::get($_POST, 'data');
		if( !$data ) die('Yeah nah');
		
		$args = [
			'pagination' => [
				'page' => (int)Utils::x($data, 'page', 0),
				'per_page' => (int)Utils::x($data, 'per_page', 10),
				'max_results' => (int)Utils::x($data, 'max_results', 0)
			],
			'sort' => [
				'by' => Utils::x($data, 'order_by', 'sequence'),
				'order' => Utils::x($data, 'order') === 'desc' ? 1 : -1
			]
		];
				
		if( !empty($data['sources']) && (int)Utils::get($data['sources'][0], 'dynamic') ){
			$sources = array_map(function($e){
				return Utils::fineCast($e);
			}, $data['sources']);
	
		} else {
			$list = $this->getL();
			$sources = $list['stream']['sources'];
			
			foreach($sources as $i=>&$src){
				if( $src['entity'] === '__AUTO_STREAM__' || strpos($src['edge'], '--') !== false ){
					$src['edge'] = explode('--', $src['edge'])[0];
					$src['entity'] = $data['sources'][$i]['entity'];
				}
			}
		}
						
		return Utils::create_api_response(
			$this->newList()->getFreshStreamItems(
				$sources,
				$args
			)
		);
	}
				
	function getStream($req=null){
		if( $req ){
			$payload = json_decode($req->get_body(), true);
			$this->setIds($payload['app_id'], $payload['lid']);
		} else {
			$this->setIds(Utils::x($_POST['data'], 'app_id'), Utils::x($_POST['data'], 'lid'));
			return $this->nonApiStream();
		}
		
		return Utils::create_api_response(
			$this->newList()->getFreshStreamItems(
				$payload['stream']['sources'],
				$payload['args']
			)
		);
	}
						
	function updateStream($req){
		$payload = json_decode($req->get_body(), true);
		$value = $this->Store->getAppValue($payload['app_id']);
		
		if( !$value ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
				
		$lid = $payload['lid'];
		$lists = $value['lists']['lists'];
		
		$this->setIds($payload['app_id'], $lid);
		
		$prev_sources = $this->groupSourcesByHash(
			isset($lists[$lid]) ?
				$lists[$lid]['stream']['sources'] : []
		);
		
		$sources = $this->groupSourcesByHash($payload['stream']['sources']);
		$force_refresh = Utils::get($payload, 'refresh', -1);
		
		$error = null;
		
		if( $force_refresh > -1 && !empty($lists[$lid]['stream']['sources'][ $force_refresh ]) ){
			$hash = Utils::hash($lists[$lid]['stream']['sources'][ $force_refresh ]);
			$this->getStreamer()->refreshStream(
				$this->Store->getSourcesByHashes([$hash])
			);
		} else {
			$removed = Utils::diff(
				array_keys($prev_sources),
				array_keys($sources)
			);
					
			$new = $this->processNewSource(
				$prev_sources, 
				$sources
			);
			
			if( is_array($new) && Utils::geto($new[1], 'error') ){
				$error = [$new[0] => $new[1]->error];
			}
			
			$value['lists']['lists'][$lid]['stream'] = $payload['stream'];
			$is_error = $this->Store->updateStream($value, $payload['app_id'], $removed, $new);
			
			if( $is_error ) {
				return $is_error;
			}
		}
		
		return Utils::create_api_response(
			$this->newList()->getNewStreamItems(
				$sources,
				$payload['args'],
				$error
			)
		);
	}
			
	function groupSourcesByHash($sources){
		return array_reduce($sources, function($acc, $cur){
			$acc[ Utils::hash($cur) ] = $cur;
			return $acc;
		}, []);
	}
	
	function processNewSource($prev_sources, $sources){
		$diff = Utils::diff(
			array_keys($sources), 
			array_keys($prev_sources)
		);
				
		if( !empty($diff) ){
			$hash = $diff[0];
			if( !empty($this->Store->getSourcesByHashes([$hash])) ){
				return $hash;
			}
			return [
				$hash,
				$this->getStreamer()->stream($sources[$hash], $hash)
			];
		}
		
		return null;
	}
				
	function checkRemovedMeta($oldlists, $lists){
		$diffsources = [];
		foreach($lists as $lid => $list){
			if( isset($oldlists[$lid]) ){
				if( $oldlists[$lid]['stream']['meta'] && !$list['stream']['meta'] ){
					$diffsources[] = $oldlists[$lid]['stream']['meta'];
				}
			}
		}
		return $diffsources;
	}
	
	function changeLists($req){
		$payload = json_decode($req->get_body(), true);
		$value = $this->Store->getAppValue($payload['app_id']);
		
		if( !$value ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
		
		$diff = Utils::diff(
			array_keys((array)$value['lists']['lists']), 
			array_keys((array)$payload['lists']['lists'])
		);
			
		$diffsources = array_merge(
			$this->checkRemovedMeta($value['lists']['lists'], $payload['lists']['lists']),
			Utils::getListsStreams($value['lists']['lists'], $diff)
		);
		
		$value['lists']['lists'] = $payload['lists']['lists'];
		$value['lists']['root'] = $payload['lists']['root'];
		
		return $this->Store->updateLists($value, $payload['app_id'], Utils::hashArray($diffsources));
	}
		
	function updateLists($req){
		$payload = json_decode($req->get_body(), true);
		$value = $this->Store->getAppValue($payload['app_id']);
		
		if( !$value ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
					
		$lists = $payload['lists'];
		$oldlists = $value['lists']['lists'];
		
		$upsert = Utils::get($lists, 'upsert', []);
		$remove =  Utils::get($lists, 'remove', []);
		//$connect =  Utils::geto($lists, 'connect', []);
		
		$diffsources = Utils::getListsStreams($oldlists, $remove);
		
		$lists = [];
		foreach($oldlists as $lid => $list){
			if( !in_array($lid, $remove) )
				$lists[$lid] = $list;
		}
		
		$upsert_old_streams = Utils::getListsStreams($oldlists, array_keys($upsert));
		$upsert_new_streams = Utils::getListsStreams($upsert, array_keys($upsert));
		
		$diffsources = array_merge(
			Utils::diff(
				Utils::hashArray($upsert_old_streams), 
				Utils::hashArray($upsert_new_streams)
			), 
			Utils::hashArray($diffsources)
		);
				
		foreach($upsert as $lid => $list){
			$lists[$lid] = $list;
		}
		
		$value['lists']['lists'] = $lists;
		
		return $this->Store->updateLists(
			$value, 
			$payload['app_id'], 
			$diffsources
		);
	}
	
	function mergeListList($req){
		$payload = json_decode($req->get_body(), true);
		$value = $this->Store->getAppValue($payload['app_id']);
		
		if( !$value ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
		
		$data = $payload['data'];
		$value['lists']['lists'][$data['lid']]['list'] = array_merge(
			$value['lists']['lists'][$data['lid']]['list'],
			$data['list']
		);
				
		$this->Store->updateApp($payload['app_id'], $value);
		
		return Utils::create_api_response(true);
	}
		
	function updateStreamOptions($req){
		$payload = json_decode($req->get_body(), true);
		$value = $this->Store->getAppValue($payload['app_id']);
		
		if( !$value ){
			return Utils::create_api_message('App doesn\'t exist', true);
		}
		
		$data = $payload['data'];
		$list = $value['lists']['lists'][$data['lid']];
		
		$list['list'] = $data['list']['list'];
		$list['config'] = $data['list']['config'];
		$list['comments'] = array_merge(
			$list['comments'], 
			$data['list']['comments']
		);
		
		$value['lists']['lists'][$data['lid']] = $list;
				
		$this->Store->updateApp($payload['app_id'], $value);
		
		return Utils::create_api_response(true);
	}
	
	function getStreamMeta($req=null){
		if( $req ){
			$payload = json_decode($req->get_body(), true);
			$this->setIds($payload['app_id'], $payload['lid']);
		} else {
			$this->setIds(Utils::x($_POST['data'], 'app_id'), Utils::x($_POST['data'], 'lid'));
			$list = $this->getL();
			$payload = ['stream' => $list['stream']['meta']];
			
			if( $payload['stream']['entity'] === '__AUTO_STREAM__' ){
				$payload['stream']['entity'] = Utils::x($_POST['data'], 'sources');
			}
		}
		return $this->getFreshStreamMeta($payload);
	}
	
	function getFreshStreamMeta($payload){
		$stream = $payload['stream'];
		$cslist = $this->newList();
				
		$hash = Utils::hash($stream);
		$meta = $cslist->getMeta($hash, true, Utils::get($payload, 'refresh', -1) > -1);
		
		if( $meta ) {
			return Utils::create_api_response(
				['meta' => $meta['extra']]
			);
		}
		
		$re = $this->getStreamer()->getMeta($stream, $hash);
		if( !$re ){
			return Utils::create_api_error('Error saving changes. Please try again or reload the page');
		}
		
		if( gettype($re) === 'object' ){
			return Utils::create_api_response(
				[
					'errors' => [
						$hash => $re->error
					]
				]
			);
			return Utils::create_api_error($re->error);
		}
		
		return Utils::create_api_response(
			['meta' => $cslist->getMeta($hash)['extra']]
		);
	}
} 

