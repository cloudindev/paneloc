require('dotenv').config({ path: '.env.local' });
const token = process.env.COOLIFY_API_TOKEN;
const baseUrl = process.env.COOLIFY_API_URL || 'http://192.168.100.10:8000/api/v1';
const githubAppUuid = process.env.COOLIFY_GITHUB_APP_UUID;

(async () => {
    // try to fetch apps
    const res = await fetch(baseUrl + '/projects', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) console.log(res.status, await res.text());
    const projects = await res.json();
    const pid = projects.length > 0 ? projects[0].uuid : 'd0ckwwskooscgwossokccw40';
    
    console.log("Testing with githubAppUuid", githubAppUuid);
    
    // Testing specific format
    const testFormat = async (format) => {
        const payload = {
          project_uuid: pid,
          environment_name: 'production',
          server_uuid: process.env.COOLIFY_SERVER_UUID || 'panel-vm',
          github_app_uuid: githubAppUuid,
          git_repository: format,
          git_branch: 'main',
          build_pack: 'nixpacks',
          ports_exposes: '3000',
          name: 'test-app-' + Date.now()
        };
        const r = await fetch(baseUrl + '/applications/private-github-app', { 
            method: 'POST', 
            headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log(`Format [${format}]:`, r.status);
        if (!r.ok) console.log(await r.text());
    };
    
    await testFormat('cloudindev/legalbos');
    await testFormat('https://github.com/cloudindev/legalbos.git');
})();
