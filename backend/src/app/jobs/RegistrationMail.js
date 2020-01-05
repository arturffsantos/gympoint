import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, start_date, end_date } = data;
    try {
      const info = await Mail.sendMail({
        to: `${student.name} <${student.email}>`,
        subject: 'Bem vindo à Academia Gympoint',
        template: 'registration',
        context: {
          student: student.name,
          start_date: format(parseISO(start_date), "dd 'de' MMMM 'de' yyyy", {
            locale: pt,
          }),
          end_date: format(parseISO(end_date), "dd 'de' MMMM 'de' yyyy", {
            locale: pt,
          }),
          plan: plan.title,
          monthlyFee: plan.price,
          duration: plan.duration,
          totalPrice: plan.price * plan.duration,
        },
      });
      return Promise.resolve(info);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default new RegistrationMail();
