<?php
require_once __DIR__ . '/../../src/Database.php';

header('Content-Type: application/json');

// POST?
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Nem engedélyezett metódus']);
    exit;
}

// Adatok beolvasása
$data = json_decode(file_get_contents('php://input'), true);

// Hiányzó?
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hiányzó felhasználónév vagy jelszó']);
    exit;
}

// Adatok feldolgozása
$username = trim($data['username']);
$password = $data['password'];

// Üres?
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Felhasználónév és jelszó nem lehet üres']);
    exit;
}

// Hossz ellenőrzés (user, pwd)
if (strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'Felhasználónév legalább 3 karakter kell legyen']);
    exit;
}

if (strlen($password) < 4) {
    http_response_code(400);
    echo json_encode(['error' => 'Jelszó legalább 4 karakter kell legyen']);
    exit;
}

// Jelszó hashelése
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Adatbázisba írás
try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashedPassword]);

    echo json_encode(['success' => true, 'message' => 'Sikeres regisztráció']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Duplikált felhasználónév ellenőrzés
        http_response_code(409);
        echo json_encode(['error' => 'Ez a felhasználónév már létezik']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Adatbázis hiba']);
    }
}
