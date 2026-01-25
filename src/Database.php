<?php

class Database
{
    private static $pdo;

    // Csatlakozás
    public static function getConnection()
    {
        if (!self::$pdo) {
            try {
                $dbPath = __DIR__ . '/../database/game.db';
                self::$pdo = new PDO("sqlite:" . $dbPath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                self::initializeTables();
            } catch (PDOException $e) {
                die("Database connection failed: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }

    // Tablák inicializálása
    // Ha még nem létezik, akkor létre kell hozni:
    private static function initializeTables()
    {
        $query = "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                xp_points INTEGER DEFAULT 0,
                xp_level INTEGER DEFAULT 1,
                save_data TEXT DEFAULT '{}'
            );
        ";
        self::$pdo->exec($query);
    }
}
