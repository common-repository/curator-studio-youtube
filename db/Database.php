<?php
namespace csyoutube\db;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

use csyoutube\core\Store;
use csyoutube\db\DB;
use csyoutube\utils\Utils;
use csyoutube\platform\Platform;

class Database {
	function __construct(){}
	
	static function generateIndices( $columns ){
		return implode(
			', ', 
			array_map(function($e){
				return "INDEX ($e)";
			}, $columns)
		);
	}

	static function createTables(){
		$charset_collate = DB::charsetCollate();
		$prefix = DB::prefix();
		
		$indices = self::generateIndices(
			explode(', ', '`platform`, `source`, `hash`')
		);
		
		$sql = 
			"CREATE TABLE IF NOT EXISTS `{$prefix}cstudio_sources` (
			  `id` int(11) AUTO_INCREMENT,
			  `platform` varchar(25) NOT NULL,
			  `source` varchar(20) NOT NULL,
			  `path` text NOT NULL,
			  `hash` varchar(32) NOT NULL,
			  `name` varchar(255) NOT NULL,
			  `items` int(11) NOT NULL,
			  `streams` int(11) NOT NULL default 1,
			  `dynamic` int(1) NOT NULL default 0,
			  `state` text NOT NULL,
			  `extra` text,
			  `created_time` datetime not null default current_timestamp,
			  `updated_time` datetime default null,
			  PRIMARY KEY (`id`),
			  $indices
			) $charset_collate;";
				
		DB::conn()->query($sql);
		
		$sql = 
			"CREATE TABLE IF NOT EXISTS `{$prefix}cstudio_apps` (
			  `id` int(11) AUTO_INCREMENT,
			  `name` varchar(255),
			  `type` varchar(15) NOT NULL,
			  `platform` varchar(25) NOT NULL,
			  `value` text NOT NULL,
			  `version` varchar(15),
			  PRIMARY KEY (`id`)
			) $charset_collate;";		
			
		DB::conn()->query($sql);
				
		$indices = self::generateIndices(
			explode(', ', '`external_id`, `likes`, `dislikes`, `comments`, `shares`, `views`, `duration`, `items`, `sequence`, `created_time`, `indexed_time`')
		);
		
		$sql = 
			"CREATE TABLE IF NOT EXISTS `{$prefix}cstudio_items` (
			  `id` varchar(128) NOT NULL,
			  `source_id` int(11) NOT NULL,
			  `external_id` varchar(128) NOT NULL,
			  `type` varchar(15) NOT NULL,
			  `author` text,
			  `title` text,
			  `text` text,
			  `media` text,
			  `likes` int(11),
			  `dislikes` int(11),
			  `comments` int(11),
			  `shares` int(11),
			  `views` int(11),
			  `duration` float(6, 2),
			  `rating` float(6, 2),
			  `items` int(6),
			  `sequence` int(10),
			  `extra` text,
			  `created_time` datetime not null default current_timestamp,
			  `updated_time` datetime default null,
			  `indexed_time` int(11) not null,
			  FOREIGN KEY (`source_id`) REFERENCES {$prefix}cstudio_sources(`id`) on DELETE CASCADE,
			  PRIMARY KEY (`id`),
			  $indices
			) $charset_collate;";	
							
		DB::conn()->query($sql);
		
		Utils::do_action('csuni_create_tables');
	}
	
	static function activate( $i = 1 ){
		$platforms = DB::get_option(DB::$keys['platforms'], []);
				
		if( $i === -1 && count($platforms) <= 1 ){
			DB::delete_option(DB::$keys['platforms']);
		} else {
			if( $i === -1 ){
				$platforms = Utils::diff($platforms, [Platform::$slug]);
			} else {
				if( !in_array(Platform::$slug, $platforms) ){
					$platforms[] = Platform::$slug;
				}
			}
			DB::update_option(DB::$keys['platforms'], $platforms);
		}
	}
	
	static function createForSite(){
		try {
			DB::begin();
			
			self::createTables();
			self::activate();
			// default settings aren't created when upgrading to PRO from free
			$new = DB::createDefaultSettings();
			
			if( !$new && Utils::apply_filters('clean_on_tier_change', false)){
				$store = new Store();
				$store->removePlatformSources();
			}
			
			DB::commit();

		} catch (\Exception $e){
			DB::rollback();
			die($e->getMessage());
		}
	}
	
	static function create( $network_wide ){
		$multis = function_exists('is_multisite') && function_exists('get_sites');
		
		if( $multis && is_multisite() && $network_wide ){
			$sites = get_sites();
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				self::createForSite();
			}
			restore_current_blog();
		} else {
			self::createForSite();
		}
	}
	
	static function getTableNames(){
		$prefix = DB::prefix();
		return array_map(function($e) use($prefix){
				return "{$prefix}{$e}";
			},	
			Utils::apply_filters(
				'csuni_table_names',
				['cstudio_apps', 'cstudio_items', 'cstudio_sources']
			)
		);
	}
	
	static function dropTables(){
		$conn = DB::conn();
		
		foreach( self::getTableNames() as $table ){
			$sql = "DROP TABLE IF EXISTS {$table} CASCADE";
			$conn->query($sql);
		}
	}
	
	static function destroySite(){
		$settings = DB::get_option( DB::$keys['settings'] );
		if( $settings && !Utils::get($settings, 'clean_on_uninstall') ) return;
		
		try{
			DB::begin();
			$platforms = DB::get_option( DB::$keys['platforms'], [] );
						
			if( count($platforms) > 1 ){
				$store = new Store();
				$store->removeApps();
			} else {
				self::dropTables();
				Utils::do_action('csuni_drop_tables');
			}
			self::activate(-1);
						
			foreach([
					DB::$keys['settings'], 
					DB::$keys['translations'], 
					'cstudio_'.Platform::$slug.'_license'
				] as $key){
					DB::delete_option( $key );
			}
			
			DB::commit();
		
		} catch (\Exception $e){
			DB::rollback();
			die($e->getMessage());
			die('Curator Studio: Datastore couldn\'t be cleaned');
			return Utils::create_error('Datastore couldn\'t be cleaned');
		}
	}
		
	static function destroy( $network_wide ){
		$multis = function_exists('is_multisite') && function_exists('get_sites');
				
		if( $multis && is_multisite() && $network_wide ){
			$sites = get_sites();
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				self::destroySite();
			}
			restore_current_blog();
		} else {
			self::destroySite();
		}
	}
	
	static function cleanSite(){
		$conn = DB::conn();
		$conn->query('set foreign_key_checks = 0');
		foreach( self::getTableNames() as $table ){
			$conn->query('truncate table ?n', $table);
		}
		$conn->query('set foreign_key_checks = 1');
		DB::clear_transients();
	}
	
	static function cleanTables( $network_wide=true ){
		$multis = function_exists('is_multisite') && function_exists('get_sites');
				
		if( $multis && is_multisite() && $network_wide ){
			$sites = get_sites();
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				self::cleanSite();
			}
			restore_current_blog();
		} else {
			self::cleanSite();
		}
	}
}
