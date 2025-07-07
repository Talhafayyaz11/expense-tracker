import express from "express";
import Category from "../models/Category";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories for user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  asyncHandler(
    async (req: AuthRequest, res: express.Response): Promise<any> => {
      const categories = await Category.find({ userId: req.user!._id }).sort({
        name: 1,
      });

      res.json({
        success: true,
        categories,
      });
    }
  )
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  asyncHandler(
    async (req: AuthRequest, res: express.Response): Promise<any> => {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.json({
        success: true,
        category,
      });
    }
  )
);

export default router;
