<?php
namespace csyoutube\utils\URL;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

class Twitter{
	static function username( $str ){
		if( strpos($str, 'twitter.com') === false ) return trim($str);
		preg_match("/http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/", $str, $matches);
		if( !empty($matches) ) return $matches[1];
		return '';
	}
}
