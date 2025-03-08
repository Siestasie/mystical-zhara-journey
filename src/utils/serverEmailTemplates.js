
// ES6 style exports for email templates

export const generateVerificationEmail = (userName, verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Подтверждение аккаунта</h2>
      <p>Здравствуйте, ${userName}!</p>
      <p>Благодарим за регистрацию. Пожалуйста, подтвердите ваш аккаунт, нажав на кнопку ниже:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Подтвердить аккаунт
        </a>
      </div>
      <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
      <p>Ссылка действительна в течение 24 часов.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
        <p>&copy; 2023 Ваша компания. Все права защищены.</p>
      </div>
    </div>
  `;
};

export const generatePasswordResetEmail = (userName, resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Сброс пароля</h2>
      <p>Здравствуйте, ${userName}!</p>
      <p>Вы запросили сброс пароля. Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Сбросить пароль
        </a>
      </div>
      <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      <p>Ссылка действительна в течение 1 часа.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
        <p>&copy; 2023 Ваша компания. Все права защищены.</p>
      </div>
    </div>
  `;
};
