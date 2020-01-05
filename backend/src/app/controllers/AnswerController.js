import HelpOrders from '../schemas/HelpOrders';

class AnswerController {
  async index(req, res) {
    const helpOrders = await HelpOrders.find({
      answer: null,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(helpOrders);
  }

  async store(req, res) {
    const helpOrder = await HelpOrders.findByIdAndUpdate(
      req.params.id,
      {
        answer: req.body.answer,
      },
      {
        new: true,
      }
    );

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order not found' });
    }

    return res.json(helpOrder);
  }
}

export default new AnswerController();
