import * as Yup from 'yup';
import { startOfDay, addMonths, parseISO } from 'date-fns';
import { Op, ForeignKeyConstraintError } from 'sequelize';
import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      order: [['end_date', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.json(registrations);
  }

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
    const startRegistration = startOfDay(parseISO(start_date));

    const registrationExists = await Registration.findOne({
      where: {
        student_id,
        end_date: {
          [Op.gt]: startRegistration,
        },
      },
    });

    if (registrationExists && registrationExists.active) {
      return res.status(400).json({ error: 'Student already enrolled' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const end_date = startOfDay(addMonths(startRegistration, plan.duration));

    let newRegistration;
    try {
      newRegistration = await Registration.create({
        student_id,
        plan_id,
        start_date: startRegistration,
        end_date,
        price: plan.price * plan.duration,
      });
    } catch (e) {
      if (e instanceof ForeignKeyConstraintError) {
        // student not found in database
        return res.status(400).json({ error: 'Invalid student' });
      }

      throw e;
    }

    return res.json(newRegistration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const registration = await Registration.findByPk(req.params.id);
    if (!registration) {
      return res.status(400).json({ error: 'Invalid registration' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const startRegistration = startOfDay(parseISO(start_date));

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const end_date = startOfDay(addMonths(startRegistration, plan.duration));

    let updatedRegistration;
    try {
      updatedRegistration = await registration.update({
        student_id,
        plan_id,
        start_date: startRegistration,
        end_date,
        price: plan.price * plan.duration,
      });
    } catch (e) {
      if (e instanceof ForeignKeyConstraintError) {
        // student not found in database
        return res.status(400).json({ error: 'Invalid student' });
      }

      throw e;
    }

    return res.json(updatedRegistration);
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({
        error: 'Registration not found',
      });
    }

    await registration.destroy();

    return res.json(registration);
  }
}

export default new RegistrationController();
