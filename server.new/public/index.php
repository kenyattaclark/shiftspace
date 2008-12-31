<?php

$dir = dirname(__FILE__);

require_once "$dir/../library/base.php";
try {
  $server = Base_Server::singleton('config/server.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

// testing

?>
