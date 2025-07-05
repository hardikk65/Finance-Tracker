import { Schema, model, models } from 'mongoose';

const budgetSchema = new Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
}, {
  timestamps: true,
});

const Budget = models.Budget || model('Budget', budgetSchema);

export default Budget; 