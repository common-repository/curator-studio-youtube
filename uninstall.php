<?php
namespace csyoutube\uninstaller;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	die('They died me');
}

spl_autoload_register(function($class){
	if( strpos($class, 'csyoutube\\') === 0 ){
		$class = str_replace('csyoutube\\', '', $class);
		$class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
		$class = __DIR__.DIRECTORY_SEPARATOR.$class;
		require_once $class.'.php';
	}
});

require_once plugin_dir_path( __FILE__ ) . '/db/Database.php';

\csyoutube\db\Database::destroy(true);
