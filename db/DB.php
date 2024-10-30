<?php
namespace csyoutube\db;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

use csyoutube\utils\Utils;
use csyoutube\db\SafeMySQL;
use csyoutube\platform\Platform;

class DB{
	static private function defaultSettings(){
		return [
			'cache_duration' => 60*12,
			'clean_on_uninstall' => false,
			'creds' => Platform::credsData()
		];
	}
	
	static $keys = [
		'platforms' => 'cstudio_platforms',
		'settings' => null,
		'translations' => null
	];
	
	static function init(){
		self::$keys['settings'] = Utils::apply_filters(
			'csuni_settings_key', 
			'cstudio_'.Platform::$slug.'_settings'
		);
		self::$keys['translations'] = 'cstudio_'.Platform::$slug.'_translations';
	}
 	
 	static private $conn = null;
		
	static function charset(){
		global $wpdb;
		return $wpdb->charset;
	}
	
	static function charsetCollate(){
		global $wpdb;
		return $wpdb->get_charset_collate();
	}
	
	static function prefix(){
		global $wpdb;
		return $wpdb->prefix;
	}
	
	static function tableNames(){
		$prefix = self::prefix();
		
		return (object)[
			'apps' => "${prefix}cstudio_apps",
			'sources' => "${prefix}cstudio_sources",
			'items' => "${prefix}cstudio_items"
		];
	}
	
	static function createConn(){
		try{
			return new SafeMySQL(
				[
					'host' => DB_HOST, 
					'user' => DB_USER, 
					'pass' => DB_PASSWORD, 
					'db' => DB_NAME, 
					'charset' => self::charset(), 
					'errmode' => 'exception'
				]
			);
		} catch(\Exception $e){
			echo $e->getMessage();
			die();
		}
	}
	
	static function conn(){
		if( self::$conn === null ){
			return self::createConn();
		}
		return self::$conn;
	}
	
	static function begin(){
		return self::conn()->conn->begin_transaction();
	}
	
	static function commit(){
		return self::conn()->conn->commit();
	}
	
	static function rollback(){
		return self::conn()->conn->rollback();
	}
	
	static function precess($rows, $precessors){
		$n = isset($precessors['n']) ? $precessors['n'] : [];
		$s = isset($precessors['s']) ? $precessors['s'] : [];
		
		if( empty($n) && empty($s) )
			return $rows;
		
		foreach($rows as &$r){
			foreach($n as $nkey){
				$r[$nkey] = (float)$r[$nkey];
			}
			
			foreach($s as $skey){
				$r[$skey] = Utils::unserialize($r[$skey]);
			}
		}
		
		return $rows;
	}
	
	static function get_transient($key){
		return get_transient($key);
	}
	
	static function set_transient($key, $value, $duration){
		return set_transient($key, $value, $duration);
	}
	
	static function clear_transients(){
		global $wpdb;
		self::conn()->query('delete from ?n where option_name like ?s', $wpdb->options, '_transient_cstudio_%');
	}
	
	static function get_option($key, $default=false){
		return get_option($key, $default);
	}
	
	static function update_option($key, $value, $autoload=false){
		return update_option($key, $value, $autoload);
	}
	
	static function delete_option($key){
		return delete_option($key);
	}
	
	static function createDefaultSettings(){
		$settings = self::get_option(self::$keys['settings']);
		if( !$settings ){
			self::update_option(self::$keys['settings'], self::defaultSettings());
			return true;
		}
		return false;
	}
	
	static function getSettings(){
		return self::get_option(self::$keys['settings'], self::defaultSettings());
	}
}

DB::init();
