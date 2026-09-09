import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ key: 1 });
  res.json({ categories });
});
