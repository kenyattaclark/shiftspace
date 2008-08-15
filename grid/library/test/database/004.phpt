--TEST--
GridDatabase - rows
--FILE--
<?php

$dir = dirname(__FILE__) . '/../../..';
include "$dir/library/database.php";
include "$dir/library/config.php";

$config = new GridConfig("$dir/config/database.ini");
$db = new GridDatabase($config->testing);

$db->query("
  DROP TABLE IF EXISTS test
");

$db->query("
  CREATE TABLE test (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(255),
    created TIMESTAMP
  );
");

$query = $db->prepare("
  INSERT INTO test
  (content)
  VALUES (:content)
");

$query->execute(array('content' => 'foo'));
$query->execute(array('content' => 'bar'));
$query->execute(array('content' => 'baz'));

echo "1. Basic query\n";

print_r($db->rows("
  SELECT id, content
  FROM test
"));

echo "2. Query with a prepared variable\n";

print_r($db->rows("
  SELECT id, content
  FROM test
  WHERE id = ?
", array(3)));

echo "3. Query with a non-default fetch style\n";

print_r($db->rows("
  SELECT id, content
  FROM test
", null, PDO::FETCH_ASSOC));

$db->query("
  DROP TABLE test
");

?>
--EXPECT--
1. Basic query
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => foo
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => bar
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => baz
        )

)
2. Query with a prepared variable
Array
(
    [0] => stdClass Object
        (
            [id] => 3
            [content] => baz
        )

)
3. Query with a non-default fetch style
Array
(
    [0] => Array
        (
            [id] => 1
            [content] => foo
        )

    [1] => Array
        (
            [id] => 2
            [content] => bar
        )

    [2] => Array
        (
            [id] => 3
            [content] => baz
        )

)
