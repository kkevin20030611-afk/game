<?php
require_once __DIR__ . '/../../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['save_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username or save_data']);
    exit;
}

$username = trim($data['username']);
// In a real app we would verify a session token here.
// For this prototype, we trust the username sent by the client (as per "Hardcore Online" but simplified for "local run").
// To make it slightly safer, we could check if user exists first, but the UPDATE will just fail/do nothing if not found.

$saveData = is_array($data['save_data']) ? json_encode($data['save_data']) : $data['save_data'];
// Also allow updating XP if sent
$xpPoints = isset($data['xp_points']) ? (int) $data['xp_points'] : null;
$xpLevel = isset($data['xp_level']) ? (int) $data['xp_level'] : null;

try {
    $pdo = Database::getConnection();

    $query = "UPDATE users SET save_data = ?";
    $params = [$saveData];

    if ($xpPoints !== null) {
        $query .= ", xp_points = ?";
        $params[] = $xpPoints;
    }
    if ($xpLevel !== null) {
        $query .= ", xp_level = ?";
        $params[] = $xpLevel;
    }

    $query .= " WHERE username = ?";
    $params[] = $username;

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
