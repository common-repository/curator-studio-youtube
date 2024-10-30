<?php
namespace csyoutube\core;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

use csyoutube\db\DB;
use csyoutube\utils\Utils;
use csyoutube\platform\Platform;

$Errors = [
	'APP_NOT_CREATED' => 'App couldn\'t be created',
	'CHANGES_NOT_SAVED' => 'Couldn\'t save changes, please try again or reload the page',
	'CHANGES_SAVED' => 'Changes updated successfully',
	'APP_DELETED' => 'App successfully deleted',
	'APP_NOT_DELETED' => 'App counldn\'t be deleted'
];

function create_error_message($msg, $e){
	global $Errors;
	return Utils::create_api_message(
		$Errors[$msg], 
		true
	);
}

class Store{
	function __construct(){
		$this->DB = DB::conn();
		$this->table = DB::tableNames();
		$this->platform = Platform::$slug;
		
		$this->ids = [
			'lid' => null,
			'app' => null
		];
		
		$this->source_casts = [
			's' => ['extra', 'path', 'state'], 
			'n' => ['id', 'items', 'streams']
		];
		$this->item_casts = [
			'n' => ['source_id', 'rating', 'views', 'dislikes', 'likes', 'comments', 'shares', 'duration', 'items'], 
			's' => ['media', 'extra', 'author']
		];
	}
		
	function getApps($type=null){
		if( $type ){
			$type = $this->DB->parse('AND type = ?s', $type);
		}
		
		return DB::precess(
			$this->DB->getAll(
				'SELECT * FROM ?n WHERE platform = ?s ?p', 
				$this->table->apps,
				$this->platform,
				$type
			), 
			['n' => ['id'], 's' => ['value']]
		);
	}
	
	function getAppsById($ids=[]){
		if( empty($ids) ) return [];
		return DB::precess(
			$this->DB->getAll(
				'SELECT * FROM ?n WHERE platform = ?s AND id IN(?a)', 
				$this->table->apps,
				$this->platform,
				$ids
			),
			['n' => ['id'], 's' => ['value']]
		);
	}
	
	function getSettings(){
		return DB::getSettings();
	}
	
	function getTranslations(){
		return DB::get_option(DB::$keys['translations']);
	}
		
	function saveKeyValue($key, $data){
		$key = Utils::get(DB::$keys, $key);
		if( !$key ) return false;
		return DB::update_option($key, $data);
	}
	
	private function insertApp($values){
		$this->DB->query(
			'INSERT INTO ?n SET ?u', 
			$this->table->apps,
			Utils::mergeSerials(
				array_merge($values, ['platform' => $this->platform]), 
				['value']
			)
		);
		return $this->DB->insertId();
	}
	
	private function createTheme($theme, $version){
		$theme = [
			'name' => $theme['meta']['name'], 
			'value' => $theme,
			'type' => 'theme',
			'version' => $version
		];
		
		return $this->insertApp($theme);
	}
	
	private function createDom($dom, $version){
		$dom = [
			'name' => '', 
			'value' => $dom,
			'type' => 'dom',
			'version' => $version
		];
		
		return $this->insertApp($dom);
	}
		
	function createApp($app, $versions){
		try {
			DB::begin();
			$theme_id = $this->createTheme($app['theme'], Utils::get($versions, 'theme'));
			$dom_id = $this->createDom($app['dom'], Utils::get($versions, 'dom'));
			
			$app_id = $this->insertApp([
				'name' => $app['name'],
				'value' => [
					'lists' => $app['lists'],
					'theme' => $theme_id,
					'dom' => $dom_id
				],
				'type' => 'app',
				'version' => Utils::get($versions, 'app')
			]);
			DB::commit();
			
			return Utils::create_api_response([
				'app' => $app_id, 
				'theme' => $theme_id,
				'dom' => $dom_id
			]);
			
		} catch (\Exception $e){
			DB::rollback();
			return create_error_message('APP_NOT_CREATED', $e);
		}
	}
	
	function updateAppName($id, $name){
		try {
			DB::begin();
			
			$this->DB->query(
				'UPDATE ?n SET `name` = ?s WHERE id = ?i', 
				$this->table->apps,
				$name,
				$id
			);
			
			DB::commit();
			return Utils::create_api_response(true);
		} catch (\Exception $e) {
			DB::rollback();
			return create_error_message('CHANGES_NOT_SAVED', $e);
		}
	}
	
	function upgradeSubApps($apps){
		try {
			DB::begin();
			
			foreach($apps as $app){
				$this->updateApp($app['id'], $app['value'], ['version' => $app['version']]);
			}
			
			DB::commit();
			return Utils::create_api_response(true);
		} catch (\Exception $e) {
			DB::rollback();
			return create_error_message('CHANGES_NOT_SAVED', $e);
		}
	}
	
	function updateSubApps($app, $id, $data){
		global $Errors;
		try {
			DB::begin();
						
			if( !empty($data['lists']) ){
				foreach($data['lists'] as $lid=>$components){
					$app['lists']['lists'][$lid]['components'] = $components;
				}
				$this->updateApp($id, $app);
			}
			
			if( !empty($data['dom']) ){
				$dom = $this->getAppValue($app['dom']);
				foreach($data['dom'] as $key=>$element){
					$dom[$key] = $element;
				}
				$this->updateApp($app['dom'], $dom);
			}
			
			if( !empty($data['theme']) ){
				$this->updateApp($app['theme'], $data['theme']);
			}
			
			DB::commit();
			return Utils::create_api_message($Errors['CHANGES_SAVED']);
		} catch (\Exception $e) {
			DB::rollback();
			return create_error_message('CHANGES_NOT_SAVED', $e);
		}
	}
	
	private function deleteApps($ids){
		$this->DB->query(
			'DELETE FROM ?n WHERE id IN(?a)', 
			$this->table->apps, 
			$ids
		);
	}
	
	function removeApp($app, $id){
		global $Errors;
		try {
			DB::begin();
						
			$this->removeAppSources(
				Utils::getListsStreams(
					$app['lists']['lists'], 
					array_keys($app['lists']['lists'])
				)
			);
			
			$this->deleteApps( [ $app['theme'], $app['dom'], $id ]);
			
			DB::commit();
			return Utils::create_api_message($Errors['APP_DELETED']);
		} catch (\Exception $e) {
			DB::rollback();
			return create_error_message('APP_NOT_DELETED', $e);
		}
	}
	
	function removeApps(){
		$this->DB->query(
			'DELETE FROM ?n WHERE platform = ?s', 
			$this->table->apps, 
			$this->platform
		);
		$this->removePlatformSources();
	}
	
	function removePlatformSources(){
		$this->DB->query(
			'DELETE FROM ?n WHERE platform = ?s', 
			$this->table->sources, 
			$this->platform
		);
	}
	
	function removeStaleSources(){
		$before = (new \DateTime())->sub(new \DateInterval('P7D'))->format('Y-m-d H:i:s');
		$this->DB->query(
			'DELETE FROM ?n WHERE updated_time < ?s', 
			$this->table->sources,
			$before
		);
	}
	
	function getAppValue($id){
		$re = $this->DB->getCol(
			'SELECT value FROM ?n WHERE id = ?i', 
			$this->table->apps, 
			$id
		);
		
		if( empty($re) ) return false;
		return Utils::unserialize($re[0]);
	}
	
	function updateApp($id, $value, $others=[]){
		$this->DB->query(
			'UPDATE ?n SET ?u WHERE id = ?i', 
			$this->table->apps, 
			array_merge(
				$others,
				['value' => Utils::serialize($value)]
			), 
			$id
		);
	}
	
	
	
	
	function updateStream($app, $id, $removed, $new){
		try{
			DB::begin();
			
			$this->removeSources($removed);
			$this->addNewSource($new);
			$this->updateApp($id, $app);
			
			DB::commit();
		} catch (\Exception $e){
			DB::rollback();
			return create_error_message('CHANGES_NOT_SAVED', $e);
		}
	}
	
	function addNewSource($new){
		if( is_array($new) ){
			if( !Utils::geto($new[1], 'error') ){
				$this->insertSource($new[1]->data);
			}
		} else if( $new ){
			$this->connectSourcesToStream([$new]);
		}
		return null;
	}
	
	function prepareMultiUpsert($items){
		$keys = array_keys($items[0]);
		$parsed_keys = array_map(function($e){
			return $this->DB->parse('?n', $e);
		}, $keys);
		
		$values = [];
		foreach($items as $it){
			$vals = [];
			foreach($keys as $k){
				$vals[] = $it[$k];
			}
			$values[] = $this->DB->parse('(?a)', $vals);
		}
		
		$updates = array_map(function($e){
			return $this->DB->parse('?n = VALUES(?n)', $e, $e);
		}, array_filter($keys, function($e){ return $e !== 'id'; }));
		
		return [
			'cols' => implode(', ', $parsed_keys),
			'vals' => implode(', ', $values),
			'updates' => implode(', ', $updates)
		];
	}
		
	function upsertItems($items, $source_id, $path, $type=null){
		$indexed = time();
				
		$items = array_map(function($r, $i) use($source_id, $indexed){
			return array_merge(
				Utils::mergeSerials($r, ['author', 'extra', 'media']), [
				'id' => "{$source_id}-{$r['external_id']}",
				'source_id' => $source_id,
				'sequence' => $indexed + $i,
				'indexed_time' => $indexed
			]);
		}, $items, array_keys($items));
		
		$parsed = $this->prepareMultiUpsert($items);
		$this->DB->query(
			'INSERT INTO ?n (?p) VALUES ?p ON DUPLICATE KEY UPDATE ?p', 
			$this->table->items,
			$parsed['cols'],
			$parsed['vals'],
			$parsed['updates']
		);
		
		if($type === 'refresh' && ($secs = Utils::apply_filters('delete_older_items_on_upsert', 0, $path))){
			$this->DB->query(
				'DELETE FROM ?n WHERE source_id = ?i AND indexed_time < ?i', 
				$this->table->items, 
				$source_id,
				$indexed - $secs
			);
		}
	}
	
	function upsertItemsAndUpdateSource($source, $re, &$sources, $type){
		try{
			DB::begin();
			if( !empty($re['items']) ){
				$this->upsertItems($re['items'], $source['id'], $source['path'], $type);
				
				$re['source']['items'] = (int)$this->DB->getOne(
					'SELECT COUNT(id) FROM ?n WHERE `source_id` = ?i', 
					$this->table->items, 
					$source['id']
				);
				$sources['data'][$source['hash']] = $re['source'];
			}
			
			$this->updateSource($source['id'], $re['source']);
			DB::commit();
		} catch(\Exception $e){
			DB::rollback();
		}
	}
		
	function updateSource($id, $src){
		$this->DB->query(
			'UPDATE ?n SET ?u WHERE id = ?i', 
			$this->table->sources,
			Utils::mergeSerials($src, ['path', 'state', 'extra']),
			$id
		);
	}
	
	function insertSource(&$re){
		try{
			DB::begin();
			if( isset($re['items']) ){
				$re['source']['items'] = count($re['items']);
			}
			
			$inserted = $this->DB->query(
				'INSERT INTO ?n SET ?u', 
				$this->table->sources,
				array_merge(
					Utils::mergeSerials(
						$re['source'], 
						['path', 'state', 'extra']
					),
					[
						'dynamic' => Utils::get($re['source']['path'], 'dynamic', 0),
						'platform' => $this->platform,
						'created_time' => Utils::currentTime(),
						'updated_time' => Utils::currentTime()
					]
				)
			);
			
			$source_id = $inserted ? $this->DB->insertId() : 0;
			if( $inserted && !empty($re['items'])){
				$this->upsertItems($re['items'], $source_id, $re['source']['path']);
			}
			
			DB::commit();
			return $source_id;
		} catch(\Exception $e){
			DB::rollback();
			return 0;
		}
	}	
	
	private function removeAppSources($sources, $purge=true){
		return $this->removeSources(
			Utils::hashArray($sources),
			$purge
		);
	}
	
	function removeSources($hashes, $purge=true){
		if( empty($hashes) ) return false;
		$this->DB->query('UPDATE ?n SET streams = streams - 1 WHERE hash IN(?a)', $this->table->sources, $hashes);
		if( $purge ) $this->DB->query('DELETE FROM ?n WHERE hash IN(?a) AND streams = ?i', $this->table->sources, $hashes, 0);
	}
	
	function connectSourcesToStream($sources){
		if( !empty($sources) ){
			$this->DB->query(
				'UPDATE ?n SET streams = streams + 1 WHERE hash IN(?a)', 
				$this->table->sources, 
				$sources
			);
		}
	}
	
	function updateLists($app, $id, $removed){
		try {
			DB::begin();
			$this->removeSources( $removed );
			$this->updateApp($id, $app);
			DB::commit();
			
			return Utils::create_api_response(true);
		} catch (\Exception $e) {
			DB::rollback();
			return create_error_message('CHANGES_NOT_SAVED', $e);
		}
	}
	
	
	
	function getSourcesByHashes($hashes){
		return DB::precess($this->DB->getAll(
			'SELECT * FROM ?n WHERE hash IN(?a)', 
			$this->table->sources, 
			$hashes
		), $this->source_casts);
	}
	
	function getSourcesByIds($ids){
		return DB::precess($this->DB->getAll(
			'SELECT * FROM ?n WHERE id IN(?a)', 
			$this->table->sources, 
			$ids
		), $this->source_casts);
	}
	
	function selectStreamItems($sources, $offset, $limit, $sort=null, $exclude=null){
		$exclude = $exclude ? $this->DB->parse('AND external_id NOT IN(?a)', $exclude) : '';
		$sort = $sort ? $this->DB->parse('ORDER BY ?n ?p', $sort['by'], $sort['order'] === 1 ? 'DESC' : 'ASC') : '';
				
		return DB::precess(
				$this->DB->getAll(
				'SELECT * FROM ?n WHERE source_id IN(?a) ?p GROUP BY external_id ?p LIMIT ?i OFFSET ?i', 
				//'SELECT * FROM ?n WHERE source_id IN(?a) ORDER BY likes DESC LIMIT ?i OFFSET ?i', 
				//'SELECT * FROM ?n WHERE source_id IN(?a) LIMIT ?i OFFSET ?i', 
				$this->table->items, 
				Utils::pick($sources, 'id'),
				$exclude,
				$sort,
				$limit,
				$offset
			),
			$this->item_casts
		);
	}
}
