const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername } = require('../dal/auth.dal');
require('dotenv').config();

exports.signup = async ({ username, password }) => {
  const user = await createUser({ username, password });
  return user;
};

exports.login = async ({ username, password }) => {
  const user = await findUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};
