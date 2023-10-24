<?php

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://services.c.web.sl.se/api/v2/departures?desiredResults=3&mode=departures&origPlaceId=QT0xQE89QnJvbW1hcGxhbiAoU3RvY2tob2xtKUBYPTE3OTM3ODY3QFk9NTkzMzgyOThAVT03NEBMPTMwMDEwOTEwOUBCPTFA&origSiteId=9109&origName=Brommaplan+%28Stockholm%29');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close($ch);

echo $result;

?>