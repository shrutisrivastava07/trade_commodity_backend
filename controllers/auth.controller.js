const authService = require('../services/auth.service');

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
