<?php
header('Content-Type: text/plain');

if (($_GET['key'] ?? '') !== 'sigigi123') {
    http_response_code(403);
    echo "Unauthorized";
    exit;
}

$logPath = __DIR__.'/../storage/logs/laravel.log';

if (!file_exists($logPath)) {
    echo "Log file not found at: " . $logPath;
    exit;
}

// Read last 200 lines
$lines = [];
$fp = fopen($logPath, 'r');
if ($fp) {
    fseek($fp, 0, SEEK_END);
    $pos = ftell($fp);
    $lineCount = 0;
    while ($pos > 0 && $lineCount < 200) {
        fseek($fp, $pos);
        $char = fgetc($fp);
        if ($char === "\n") {
            $lineCount++;
        }
        $pos--;
    }
    fseek($fp, $pos + 1);
    while (!feof($fp)) {
        echo fgets($fp);
    }
    fclose($fp);
} else {
    echo "Failed to open log file.";
}
