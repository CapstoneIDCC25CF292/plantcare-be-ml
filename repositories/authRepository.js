const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { generateToken } = require("../utils/jwt");

exports.signup = async (email, username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cek apakah email sudah digunakan
  const existingEmail = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.rows.length > 0) {
    throw new Error("Email already exists");
  }

  // Cek apakah username sudah digunakan
  const existingUsername = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  if (existingUsername.rows.length > 0) {
    throw new Error("Username already exists");
  }

  // Jika keduanya aman, lanjut buat user baru
  const result = await db.query(
    "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, username",
    [email, username, hashedPassword]
  );

  return result.rows[0];
};

exports.signin = async (email, password) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const token = generateToken(payload, "1h");

  return token;
};

exports.me = async (id) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  return payload;
};
