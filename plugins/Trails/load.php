<?php 

if (!empty($_POST['href'])) 
{
  $href = $db->escape($_POST['href']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$trailId = $db->escape($_POST['trailId']);
$version = $db->escape($_POST['version']);

$trail = $db->row("
  SELECT t.title, t.content, t.created, t.modified, t.url_slug, t.status, t.thumb_status, u.username
  FROM trail t, user u
  WHERE u.id = t.user_id
  AND t.url_slug = '$trailId'
");

echo json_encode($trail);

?>