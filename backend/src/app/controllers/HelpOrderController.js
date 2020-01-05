import HelpOrders from '../schemas/HelpOrders';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrders.find({
      student_id: req.params.id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(helpOrders);
  }

  async store(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Invalid student' });
    }

    const helpOrder = await HelpOrders.create({
      student_id: req.params.id,
      question: req.body.question,
    });

    return res.status(201).json(helpOrder);
  }
}

export default new HelpOrderController();
