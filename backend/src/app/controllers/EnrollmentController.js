import * as Yup from 'yup';
import { startOfDay, addMonths, parseISO } from 'date-fns';
import { Op, ForeignKeyConstraintError } from 'sequelize';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const startEnrollment = startOfDay(parseISO(start_date));

    const enrollmentExists = await Enrollment.findOne({
      where: {
        student_id,
        canceled_at: null,
        end_date: {
          [Op.gt]: startEnrollment,
        },
      },
    });

    if (enrollmentExists) {
      return res.status(400).json({ error: 'Student already enrolled' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const end_date = startOfDay(addMonths(startEnrollment, plan.duration));

    let newEnrollment;
    try {
      newEnrollment = await Enrollment.create({
        student_id,
        plan_id,
        start_date: startEnrollment,
        end_date,
        price: plan.price,
      });

      return res.json(newEnrollment);
    } catch (e) {
      if (e instanceof ForeignKeyConstraintError) {
        // student not found in database
        return res.status(400).json({ error: 'Invalid student' });
      }
    }

    return res.json(newEnrollment);
  }
}

export default new EnrollmentController();
