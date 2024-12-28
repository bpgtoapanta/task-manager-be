const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Task = require('../models/Task');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 */
router.post(
  '/',
  body('title').notEmpty().withMessage('El título es obligatorio'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const task = new Task(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener lista de tareas
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de la tarea
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/', async (req, res, next) => {
  try {
    const { completed } = req.query;
    const filter = completed !== undefined ? { completed: completed === 'true' } : {};
    const tasks = await Task.find(filter);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener detalles de una tarea específica
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Detalles de la tarea
 *       404:
 *         description: Tarea no encontrada
 */
router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID inválido'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       404:
 *         description: Tarea no encontrada
 */
router.put(
  '/:id',
  param('id').isMongoId().withMessage('ID inválido'),
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *       404:
 *         description: Tarea no encontrada
 */
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('ID inválido'),
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.status(200).json({ message: 'Tarea eliminada' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
