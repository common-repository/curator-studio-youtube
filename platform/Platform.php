<?php
namespace csyoutube\platform;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

use csyoutube\utils\Utils;
use csyoutube\db\DB;

class Platform{
	static $slug = 'youtube';
	static $label = 'YouTube';
	static $name = 'Curator Studio - YouTube';
	
	static function init(){
		Utils::$platform = self::$slug;
		
		Utils::add_filter('clean_on_tier_change', function($arg){
			return true;
		}, 1, 1);
		
		Utils::add_filter('delete_older_items_on_upsert', function($arg, $path){
			if( in_array($path['edge'], ['search-videos', 'trending-videos', 'category-videos', 'search-playlists']) ){
				return 100;
			}
			return $arg;
		}, 1, 2);
		
		add_action('admin_init', function(){
			self::setCreds();
		});
	}
	
	static function sourceNames(){
		return ['youtube'];
	}

	static function sourceClasses(){
		return [
			'youtube' => new \csyoutube\platform\YouTube()
		];
	}
	
	static function setCreds($api=false){
		$params = Utils::q('cs-yt-token');
		if(!$params) return null;
		
		$settings = DB::getSettings();
		
		$settings['creds'][self::$slug] = array_merge(
			$settings['creds'][self::$slug],
			[
				'key' => $params
			]
		);
															
		DB:update_option(DB::$keys['settings'], $settings);
		
		if( $api ){
			return $settings;
		}
		return null;
	}
	
	static function credsData(){
		return array_reduce(self::sourceNames(), function($acc, $cur){
			$acc[$cur] = ['key' => Utils::g('universe') ? '' : 'AIzaSyAvws3jxM6R6tF2U9BphB3O6Zmljg2uq2A'];
			return $acc;
		}, []);
	}
	
	static function editorVars(){
		return [
			'source' => [
				'limit' => [
					'any' => 50
				]
			],
			'pagination' => [
				'items' => 12,
				'comments' => 10
			]
		];
	}
}
