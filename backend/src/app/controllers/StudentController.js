import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const students = await Student.findAll({
      order: ['name'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .positive()
        .required(),
      weight: Yup.number()
        .integer()
        .positive(),
      height: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email } = await Student.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .integer()
        .positive(),
      weight: Yup.number().positive(),
      height: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { email: newEmail } = req.body;

    const student = await Student.findByPk(req.params.studentId);

    if (newEmail && newEmail !== student.email) {
      const studentExists = await Student.findOne({
        where: { email: newEmail },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists' });
      }
    }

    const { id, name, email } = await student.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new StudentController();
