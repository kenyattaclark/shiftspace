<?php

if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

if (!empty($_POST['shiftId'])) 
{
  $shiftId = $db->escape($_POST['shiftId']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}
if (!empty($_POST['content']))
{
  $content = $db->escape($_POST['content']);
}

// grab the real shift id
$shift = $db->row("
  SELECT id 
  FROM shift
  WHERE url_slug='$shiftId'
");

if(!$shift)
{
  echo "{status: 0, message:'The shift that you're trying to comment on does not exist.'}";
  exit;
}

$created = date('Y-m-d H:i:s');

// insert it
// Record a general accounting of shift
$db->query("
  INSERT INTO comment
  (user_id, content, shift_id, created, modified)
  VALUES ($user->id, '$content', $shift->id, '$created', '$created')
  ");
  
$owner = $db->row("
  SELECT *
  FROM user
  WHERE id = $shift->user_id
");
  
// email the owner
$subject = "Shiftspace user $user->username has commented on your shift!";
$body = wordwrap("Hello $owner->username,

You have a new comment on your shift!

<a href='$shift->href'>Original link</a>
<a href='http://metatron.shiftspace.org/sandbox/$shift->url_slug'>Proxy link</a>

Kisses,
The ShiftSpace email robot
");
mail($owner->email, $subject, $body, "From: ShiftSpace <info@shiftspace.org>\n");

// return success
echo "{status: 1, message:'Success. Comment added.'}";
?>