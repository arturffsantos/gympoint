import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Registration from '../models/Registration';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
      },
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const { id } = req.params;

    const registrationExists = await Registration.findOne({
      where: {
        student_id: id,
        end_date: {
          [Op.gt]: new Date(),
        },
      },
      attributes: ['id', 'active'],
    });

    if (!registrationExists || !registrationExists.active) {
      return res
        .status(400)
        .json({ error: 'Student does not have active plan' });
    }

    const MAX_NUMBER_CHECKINS = 5;
    const NUMBER_DAYS_CHECKINS = 7;

    const numberOfCheckins = await Checkin.count({
      where: {
        student_id: id,
        created_at: {
          [Op.gte]: subDays(new Date(), NUMBER_DAYS_CHECKINS),
        },
      },
    });

    if (numberOfCheckins >= MAX_NUMBER_CHECKINS) {
      return res.status(403).json({
        error: `Max number of checkins reached (${MAX_NUMBER_CHECKINS}) in ${NUMBER_DAYS_CHECKINS} days`,
      });
    }

    const newCheckin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json(newCheckin);
  }
}

export default new CheckinController();
