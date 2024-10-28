const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.post('/register', [
  body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
], async (req, res) => {
    console.log('Registro Iniciado');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erores',errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    console.log('Registrando usuario:', username);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ msg: 'Usuario registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

router.post('/login', [
  body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ msg: 'Esta es una ruta protegida', user: req.user });
});

module.exports = router;

