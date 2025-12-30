/**
 * Test Telegram connection with various TLS options
 */
const https = require('https');
const tls = require('tls');

console.log("=== TELEGRAM TLS DEBUG ===\n");

// Test with different TLS settings
async function testTelegram(options, name) {
    return new Promise((resolve) => {
        console.log(`Testing: ${name}...`);

        const req = https.get('https://api.telegram.org/bot123:test/getMe', {
            timeout: 15000,
            ...options
        }, (res) => {
            console.log(`  ✅ ${name}: Status ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (e) => {
            console.log(`  ❌ ${name}: ${e.code || e.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log(`  ❌ ${name}: Timeout`);
            req.destroy();
            resolve(false);
        });
    });
}

async function runTests() {
    // Test 1: Default
    await testTelegram({}, 'Default TLS');

    // Test 2: Disable TLS verification (INSECURE - for debug only)
    await testTelegram({
        rejectUnauthorized: false
    }, 'No Certificate Check');

    // Test 3: Force TLS 1.2
    await testTelegram({
        secureProtocol: 'TLSv1_2_method',
        rejectUnauthorized: false
    }, 'TLS 1.2 Forced');

    // Test 4: Custom ciphers
    await testTelegram({
        rejectUnauthorized: false,
        ciphers: 'HIGH:!aNULL:!MD5'
    }, 'Custom Ciphers');

    console.log("\n=== ANALYSIS ===");
    console.log("If ALL tests fail: The connection to api.telegram.org is being blocked/reset.");
    console.log("This is likely deep packet inspection (DPI) by your ISP.");
    console.log("Solutions:");
    console.log("1. Use a different VPN server");
    console.log("2. Enable 'Fragment' or 'TLS Masking' in v2rayN settings");
    console.log("3. Try a different protocol (VLESS -> VMESS or vice versa)");
}

runTests();
