<?php
/**
 * @package Curator Studio - YouTube - Show videos from channels, playlists and more
 * @version 0.1.3
 */
/*
	Plugin Name: Curator Studio - YouTube
	Plugin URI: https://curatorstudio.io/youtube/
	Description: Select & curate content from YouTube.
	Author: Plugin Builders
	Version: 0.1.3
	Author URI: https://curatorstudio.io/
	Text Domain: curator-studio-youtube
*/

namespace csyoutube;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

spl_autoload_register(function($class){
	if( strpos($class, 'csyoutube\\') === 0 ){
		$class = str_replace('csyoutube\\', '', $class);
		$class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
		$class = __DIR__.DIRECTORY_SEPARATOR.$class;
		require_once $class.'.php';
	}
});

if( !function_exists('onActivation') ){
	function onActivation( $network_wide ){
		\csyoutube\db\Database::create( $network_wide );
	}
}

function setup(){
	\csyoutube\Entry::make();
}

function start(){
	register_activation_hook(__FILE__, '\csyoutube\onActivation');					
	add_action('plugins_loaded', '\csyoutube\setup');
}

start();
