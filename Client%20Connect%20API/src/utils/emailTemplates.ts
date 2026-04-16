interface NotificationObj {
  message: string;
  title: string;
  type: "info" | "warning" | "error" | "success"; // Use an enum or a union type for valid types
  link: string;
  variant: "email" | "app"; // Use an enum or a union type for valid variants
}

export const emailNotificationTemplate = (notification: NotificationObj) => {
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Notification</title>
        </head>
        <body>
            <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
                <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                    <h1 style="color: #333333; font-size: 24px;">${notification.title}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px;">
                                    <p>${notification.message}</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                    <a href="${notification.link}" style="text-decoration: none; background-color: #0070c0; color: #ffffff; padding: 10px 20px; border-radius: 5px;">Read More</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

  return html;
};
