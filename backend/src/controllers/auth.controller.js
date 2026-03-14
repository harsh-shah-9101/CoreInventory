const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );
    res.status(201).json({ message: 'Account created', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (!result.rows.length)
    return res.status(404).json({ error: 'User not found' });

  const user = result.rows[0];

  if (user.password !== password)
    return res.status(401).json({ error: 'Invalid credentials' });

  // Save user in session
  req.session.user = { id: user.id, name: user.name, email: user.email };
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