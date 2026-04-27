export default {
  async scheduled(event, env, ctx) {
    const { MIKROTIK_HOSTNAME, CF_ZONE_ID, CF_RECORD_ID, CF_API_TOKEN, CF_RECORD_NAME } = env;

    // 1. Resolve MikroTik IP (Add random param to bypass DNS cache)
    const dnsReq = await fetch(`https://cloudflare-dns.com/dns-query?name=${MIKROTIK_HOSTNAME}&type=A&_random=${Math.random()}`, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const dnsRes = await dnsReq.json();
    
    if (!dnsRes.Answer?.[0]?.data) {
      console.error("DNS Resolution failed for MikroTik hostname.");
      return;
    }
    const newIP = dnsRes.Answer[0].data;

    // 2. Get CURRENT Cloudflare Record to see if it even needs updating
    const getRecord = await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${CF_RECORD_ID}`, {
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` }
    });
    const recordData = await getRecord.json();
    const currentCFIP = recordData.result?.content;

    if (currentCFIP === newIP) {
      console.log(`No update needed. ${CF_RECORD_NAME} is already pointing to ${newIP}`);
      return;
    }

    // 3. Perform the Update
    console.log(`IP Change detected! Updating ${CF_RECORD_NAME}: ${currentCFIP} -> ${newIP}`);
    const updateReq = await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${CF_RECORD_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newIP, name: CF_RECORD_NAME, type: 'A' })
    });

    const updateRes = await updateReq.json();

    if (updateReq.ok) {
      console.log(`Update successful.`);
    } else {
      console.error("Cloudflare API Error:", JSON.stringify(updateRes.errors));
    }
  }
};
