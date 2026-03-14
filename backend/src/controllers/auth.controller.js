const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// SIGNUP
exports.signup = async (req, res) => {
  const { name, login_id, email, password, role } = req.body;
  const userRole = role === 'warehouse_staff' ? 'warehouse_staff' : 'manager';

  // 1. login ID should be unique and must be in between 6-12 characters.
  if (!login_id || login_id.length < 6 || login_id.length > 12) {
    return res.status(400).json({ error: 'Login ID must be between 6 and 12 characters.' });
  }

  // 3. Password must contain a small case, a large case and a special character and length should be more than 8 characters.
  if (!password || password.length <= 8) {
    return res.status(400).json({ error: 'Password must be more than 8 characters.' });
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain a small case, a large case, and a special character.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, login_id, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, login_id, email, role',
      [name, login_id, email, password, userRole]
    );
    res.status(201).json({ message: 'Account created', user: result.rows[0] });
  } catch (err) {
    if (err.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (err.constraint === 'unique_login_id') {
      return res.status(400).json({ error: 'Login ID already exists' });
    }
    console.error(err);
    res.status(400).json({ error: 'Signup failed. Check credentials.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { login_id, password } = req.body;
  
  // Use exact error message from diagram: "Invalid Login Id or Password"
  if (!login_id || !password) {
    return res.status(401).json({ error: 'Invalid Login Id or Password' });
  }

  const result = await pool.query('SELECT * FROM users WHERE login_id = $1', [login_id]);

  if (!result.rows.length)
    return res.status(401).json({ error: 'Invalid Login Id or Password' });

  const user = result.rows[0];

  if (user.password !== password)
    return res.status(401).json({ error: 'Invalid Login Id or Password' });

  // Save user in session (including role)
  req.session.user = { id: user.id, name: user.name, login_id: user.login_id, email: user.email, role: user.role };
  res.json({ message: 'Login successful', user: req.session.user });
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

// SEND OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (!result.rows.length)
    return res.status(404).json({ error: 'Email not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await pool.query(
    'INSERT INTO otp_tokens (user_id, otp_code, expires_at) VALUES ($1, $2, $3)',
    [result.rows[0].id, otp, expires]
  );

  await sendEmail(email, otp);
  res.json({ message: 'OTP sent to email' });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Add password validation
  if (!newPassword || newPassword.length <= 8) {
    return res.status(400).json({ error: 'Password must be more than 8 characters.' });
  }
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain a small case, a large case, and a special character.' });
  }

  const user = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (!user.rows.length)
    return res.status(404).json({ error: 'User not found' });

  const record = await pool.query(
    `SELECT * FROM otp_tokens 
     WHERE user_id = $1 AND otp_code = $2 AND used = FALSE AND expires_at > NOW()
     ORDER BY expires_at DESC LIMIT 1`,
    [user.rows[0].id, otp]
  );

  if (!record.rows.length)
    return res.status(400).json({ error: 'Invalid or expired OTP' });

  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, user.rows[0].id]);
  await pool.query('UPDATE otp_tokens SET used = TRUE WHERE id = $1', [record.rows[0].id]);

  res.json({ message: 'Password reset successful' });
};