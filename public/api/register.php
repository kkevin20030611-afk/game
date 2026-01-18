<?php
require_once __DIR__ . '/../../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username or password']);
    exit;
}

$username = trim($data['username']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $password]);

    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate username)
        http_response_code(409);
        echo json_encode(['error' => 'Username already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
