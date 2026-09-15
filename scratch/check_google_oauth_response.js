async function checkGoogle() {
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=lakkimsetti.rahulashokh&redirect_to=http%3A%2F%2Flocalhost%3A8080%2Fauth-callback.html&redirect_uri=https%3A%2F%2Fkkdqahqcochicfvkfyan.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&state=test';
    const res = await fetch(url);
    console.log('Google Auth Endpoint HTTP Status:', res.status);
    const body = await res.text();
    const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title');
    if (body.includes('invalid_client') || body.includes('Error 400') || body.includes('Error:')) {
        console.log('Contains client error:');
        const errMatch = body.match(/(Error:\s*[^<]+|The OAuth client was not found[^<]*)/i);
        console.log('Extracted message:', errMatch ? errMatch[0] : body.slice(0, 400));
    }
}
checkGoogle().catch(console.error);
