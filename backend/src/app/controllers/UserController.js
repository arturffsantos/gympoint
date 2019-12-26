import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { email: newEmail, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (newEmail && newEmail !== user.email) {
      const userExists = await User.findOne({
        where: { email: newEmail },
      });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match!' });
    }

    const { id, name, email } = await user.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new UserController();
