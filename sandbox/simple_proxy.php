<?php
/**********
USAGE:
simple_proxy.php?url=http://www.somesite.tld
***********/

function get_page($myurl)
{
  $curl = curl_init();
  curl_setopt($curl,CURLOPT_URL,$myurl);
  curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($curl,CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl,CURLOPT_COOKIE, 1);
  $result = curl_exec($curl);
  curl_close($curl);
  if(!$result){
    $result = "Page not found.";
    return "<p style=\"color:#DD6666;font-size:1em;font-family:Verdana,Helvetica,sans-serif;\">" .
      $result . "</p>";
  }
  //test if url begins with http:// if not add it
  if(!preg_match("/^http:\/\//",$myurl)){
  	$myurl = "http://" . $myurl;
  }
  //test wether url ends with a / if not add one
  if(!preg_match("/[a-zA-Z]+\/$/",$myurl)){
  	$myurl = $myurl . "/";
  }
  //get the base url
  preg_match("/^(http:\/\/)?([^\/]+)/i",$myurl, $matches);
  $baseurl = $matches[2];
  //replace relative links with absolute links
  //if beings with src="/
  $result = preg_replace("/src=\"\//i","src=\"$myurl" ,$result);
  //if begins with src="../
  $result = preg_replace("/src=\"\.\./i","src=\"$myurl.." ,$result);
  //if begins with src="word/ && word != http or www
  $result = preg_replace("/src=\"(?!http|www)/","src=\"$myurl",$result);
  //for href
  $result = preg_replace("/href=\"\//i","href=\"$myurl" ,$result);
  $result = preg_replace("/href=\"\.\./i","href=\"$myurl.." ,$result);
  //proxy links
  $result = preg_replace("/a href=\"/i","a href=\"simple_proxy.php?url=", $result);
  //fix css imports
  $result = preg_replace("/@import\s+\"\//","@import \"http://$baseurl/", $result);
  //fix css for for href=\"/css/essay.css
  $result = preg_replace("/href=\\\"\//","href=\\\"$myurl", $result);
  //remove 'most' javascript
  //$result = preg_replace("/\<script.+\<\/script>/im","<!removedjavascript-->",$result);
  //insert ShiftSpace
  $ShiftSpace = '<script type="text/javascript" charset="utf-8">
      var ShiftSpaceSandBoxMode = true;
    </script>
    <script src="greasemonkey-api.js" type="text/javascript"></script>
    <script src="../shiftspace.php?method=shiftspace.user.js&sandbox=1" type="text/javascript" charset="utf-8"></script>';
  $result = preg_replace("/<\/head>/",$ShiftSpace . "</head>", $result);
  return $result;
}

$page = array_key_exists('url', $_GET)? $_GET['url'] : "";
$processedPage = get_page($page);
print $processedPage;
?>