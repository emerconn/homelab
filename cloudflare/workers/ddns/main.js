export default {
  async scheduled(event, env, ctx) {
    // 1. Pull all configuration from Environment Variables
    const mikrotikHostname = env.MIKROTIK_HOSTNAME;
    const zoneId = env.CF_ZONE_ID;
    const recordId = env.CF_RECORD_ID;
    const apiToken = env.CF_API_TOKEN;
    const recordName = env.CF_RECORD_NAME;

    // 2. Resolve your MikroTik hostname using Cloudflare's DoH
    const dnsReq = await fetch(`https://cloudflare-dns.com/dns-query?name=${mikrotikHostname}&type=A`, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const dnsRes = await dnsReq.json();
    
    if (!dnsRes.Answer || dnsRes.Answer.length === 0) {
      console.log("Could not resolve MikroTik hostname.");
      return;
    }
    const currentIP = dnsRes.Answer[0].data;

    // 3. Update the A record
    const updateReq = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: currentIP,
        name: recordName,
        type: 'A'
      })
    });

    if (updateReq.ok) {
      console.log(`Successfully updated ${recordName} to ${currentIP}`);
    } else {
      console.error("Failed to update Cloudflare record.");
    }
  }
};
