// Standalone lightweight Vercel Serverless Function for /api/config
// Zero heavy dependencies to ensure instant execution and 100% uptime

module.exports = (req, res) => {
    // CORS & Cache Headers
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    const supabaseUrl = process.env.SUPABASE_URL || 'https://kkdqahqcochicfvkfyan.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZHFhaHFjb2NoaWNmdmtmeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTMyNjEsImV4cCI6MjEwNDA4OTI2MX0.jMTz-nEpA-GfOqrGvYCC22gmZ7oiMe1e6Sf5z7GqDvc';
    
    const host = req.headers ? req.headers.host : '';
    const proto = (req.headers && req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : 'https';
    const appUrl = host ? `${proto}://${host}` : (process.env.APP_URL || 'https://tech-path-six.vercel.app');

    const config = {
        supabaseUrl,
        supabaseAnonKey,
        appUrl,
        isSupabaseConfigured: true,
        isAIConfigured: Boolean(process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY),
        aiProvider: process.env.OPENROUTER_API_KEY ? 'OpenRouter Cloud AI' : 'Gemini AI',
        supportEmail: 'lakkimsettirahulashokh@gmail.com'
    };

    res.statusCode = 200;
    return res.end(JSON.stringify(config));
};
