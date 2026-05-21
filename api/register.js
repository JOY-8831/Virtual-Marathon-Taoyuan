import { sheets } from '../lib/google.js'

try {

    const {
        name,
        gender,
        birthday,
        phone,
        email,
        category
    } = req.body

    const runnerId = `TVR${Date.now()}`

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'register!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                runnerId,
                new Date().toISOString(),
                name,
                gender,
                birthday,
                phone,
                email,
                category,
                'registered'
            ]]
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Taiwan Virtual Run 報名成功',
        html: `
        <h2>報名成功！</h2>

        <p>您好 ${name}</p>

        <p>您已成功報名 Taiwan Virtual Run。</p>

        <p>
          跑者編號：
          <strong>${runnerId}</strong>
        </p>

        <p>請妥善保存您的跑者編號。</p>
      `
    })

    return res.status(200).json({
        success: true,
        runnerId
    })

} catch (error) {

    console.error(error)

    return res.status(500).json({
        success: false,
        error: error.message
    })
}