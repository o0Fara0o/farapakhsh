/**
 * Deep Network Diagnostic Script
 * Tests various connection methods to identify the issue
 */
const https = require('https');
const http = require('http');

console.log("=== NODE.JS NETWORK DIAGNOSTIC ===\n");

// Test 1: Direct HTTPS to Google (should work if TUN is active)
async function testDirect(url, name) {
    return new Promise((resolve) => {
        console.log(`Testing: ${name}...`);
        const req = https.get(url, { timeout: 10000 }, (res) => {
            console.log(`  ✅ ${name}: Status ${res.statusCode}`);
            resolve(true);
        });
        req.on('error', (e) => {
            console.log(`  ❌ ${name}: ${e.message}`);
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
    // Test 1: Google (should always work with TUN)
    await testDirect('https://www.google.com', 'Google (Direct)');

    // Test 2: Telegram API
    await testDirect('https://api.telegram.org', 'Telegram API (Direct)');

    // Test 3: Local Iranian site (should work without VPN)
    await testDirect('https://eitaayar.ir', 'Eitaayar.ir (Iran)');

    console.log("\n=== ENVIRONMENT VARIABLES ===");
    console.log("HTTP_PROXY:", process.env.HTTP_PROXY || "(not set)");
    console.log("HTTPS_PROXY:", process.env.HTTPS_PROXY || "(not set)");
    console.log("ALL_PROXY:", process.env.ALL_PROXY || "(not set)");
    console.log("NO_PROXY:", process.env.NO_PROXY || "(not set)");

    console.log("\n=== NODE VERSION ===");
    console.log("Node:", process.version);
    console.log("Platform:", process.platform);
}

runTests();
