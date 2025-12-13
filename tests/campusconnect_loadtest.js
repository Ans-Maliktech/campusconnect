import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
export const options = {
    // Ramp up traffic gradually to find the breaking point
    stages: [
        { duration: '30s', target: 50 },   // Warm up: Safe for Free Tier
        { duration: '1m', target: 250 },   // Load: Stress the Render CPU/Memory
        { duration: '30s', target: 500 },  // Heavy Load: Stress the MongoDB Connection Limit
        { duration: '30s', target: 0 },    // Cooldown
    ],
    thresholds: {
        // 90% of requests must complete in under 500ms
        http_req_duration: ['p(90)<500'], 
        // 95% of requests must return a 200 OK status
        'checks': ['rate>0.95'],
    },
};

// --- TEST SCENARIO ---
export default function () {
    // 🚨 IMPORTANT: Replace this with your LIVE Render Backend URL

// --- CRITICAL FIX: Use the Docker bridge hostname for Windows/Mac ---
const BASE_URL = 'http://host.docker.internal:5000/api';
    
    // 1. HEALTH CHECK TEST (The Clean Stability Test)
    // FIX APPLIED HERE: Backticks (`) wrap the entire string
    let res = http.get(`${BASE_URL}/health`);

    check(res, {
        '01. Health Status is 200': (r) => r.status === 200,
        '02. Health Response Time (<300ms)': (r) => r.timings.duration < 300,
    });
    
    // 2. CONCURRENT LISTING VIEW TEST (The Real-World Read Test)
    // FIX APPLIED HERE: Backticks (`) wrap the entire string
    res = http.get(`${BASE_URL}/listings?page=1&limit=9`);

    check(res, {
        '03. Listings Status is 200': (r) => r.status === 200,
        '04. Listings Response Time (<500ms)': (r) => r.timings.duration < 500,
    });

    // Sleep for 1 to 3 seconds between actions to simulate human browsing
    sleep(Math.random() * 2 + 1); 
}