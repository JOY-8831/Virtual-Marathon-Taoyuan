import { google } from 'googleapis'

export default async function handler(req, res) {

    // 只接受 POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        })
    }

    try {

        // 取得前端送來的資料
        const {
            name,
            email,
            category,
            distance
        } = req.body

        // 基本驗證
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        // Google Service Account 驗證
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,

                // Vercel 的 private key 必須 replace
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
            },

            scopes: [
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        })

        // 建立 sheets client
        const sheets = google.sheets({
            version: 'v4',
            auth
        })

        // 現在時間
        const timestamp = new Date().toISOString()

        // 寫入 Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,

            // Sheet 名稱
            range: 'registrations!A:E',

            valueInputOption: 'USER_ENTERED',

            requestBody: {
                values: [[
                    timestamp,
                    name,
                    email,
                    category,
                    distance
                ]]
            }
        })

        // 成功回傳
        return res.status(200).json({
            success: true,
            message: 'Registration successful'
        })

    } catch (error) {

        console.error('ERROR:', error)

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }
}