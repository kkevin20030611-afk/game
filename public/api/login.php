<?php
require_once __DIR__ . '/../../src/Database.php';

header('Content-Type: application/json');

// POST? 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Nem engedélyezett metódus']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Hiányzó?
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hiányzó felhasználónév vagy jelszó']);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

// Üres?
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Felhasználónév és jelszó nem lehet üres']);
    exit;
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Jelszó eltávolítása a válaszból
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Hibás felhasználónév vagy jelszó']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Adatbázis hiba']);
}
