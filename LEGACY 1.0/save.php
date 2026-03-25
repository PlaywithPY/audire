<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['file']) || !isset($data['content'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing file or content']);
  exit;
}

$file = $data['file'];
$content = $data['content'];

// Whitelist des fichiers autorisés
$allowed = ['config.json', 'textes.json', 'design.json'];
if (!in_array($file, $allowed)) {
  http_response_code(403);
  echo json_encode(['error' => 'File not allowed']);
  exit;
}

$path = __DIR__ . '/content/' . $file;

// Sauvegarder avec pretty-print
$json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
  http_response_code(500);
  echo json_encode(['error' => 'JSON encoding failed']);
  exit;
}

if (file_put_contents($path, $json) === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to write file']);
  exit;
}

echo json_encode(['success' => true, 'file' => $file]);
?>
