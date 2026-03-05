#!/usr/bin/env ts-node
/**
 * Crawl4ai CLI Tool
 * 
 * Interact with Crawl4AI API from command line
 * 
 * Usage:
 *   npx ts-node CrawlApi.ts crawl <url>
 *   npx ts-node CrawlApi.ts extract <url> <selector>
 *   npx ts-node CrawlApi.ts batch <file>
 *   npx ts-node CrawlApi.ts health
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = process.env.CRAWL4AI_URL || 'http://app-server-2.jerboa-boa.ts.net:11235';

// Get token from env or secrets file
function getToken(): string {
  if (process.env.CRAWL4AI_TOKEN) {
    return process.env.CRAWL4AI_TOKEN;
  }
  
  const secretsPath = path.join(process.env.HOME || '', '.opencode', 'skills', 'CORE', 'USER', 'SECRETS', 'crawl4ai_token');
  if (fs.existsSync(secretsPath)) {
    return fs.readFileSync(secretsPath, 'utf-8').trim();
  }
  
  return '';
}

interface CrawlResult {
  success: boolean;
  url?: string;
  markdown?: string;
  html?: string;
  links?: { internal: string[]; external: string[] };
  media?: { images: any[]; videos: any[] };
  metadata?: { title?: string; description?: string };
  error?: string;
}

async function health(): Promise<void> {
  const response = await fetch(`${API_BASE}/health`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

async function crawl(url: string, options: Record<string, any> = {}): Promise<CrawlResult> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const body: Record<string, any> = {
    urls: url,
    ...options
  };
  
  const response = await fetch(`${API_BASE}/crawl_sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  return response.json();
}

async function batch(urls: string[], options: Record<string, any> = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const body: Record<string, any> = {
    urls: urls,
    ...options
  };
  
  const response = await fetch(`${API_BASE}/crawl_sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  return response.json();
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'health':
      await health();
      break;
      
    case 'crawl':
      const crawlUrl = args[1];
      if (!crawlUrl) {
        console.error('Usage: CrawlApi.ts crawl <url>');
        process.exit(1);
      }
      const crawlOptions: Record<string, any> = {};
      if (args.includes('--selector')) {
        crawlOptions.css_selector = args[args.indexOf('--selector') + 1];
      }
      if (args.includes('--screenshot')) {
        crawlOptions.screenshot = true;
      }
      if (args.includes('--magic')) {
        crawlOptions.magic = true;
      }
      const result = await crawl(crawlUrl, crawlOptions);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'batch':
      const batchFile = args[1];
      if (!batchFile) {
        console.error('Usage: CrawlApi.ts batch <file>');
        process.exit(1);
      }
      const urls = fs.readFileSync(batchFile, 'utf-8')
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.startsWith('#'));
      const batchResult = await batch(urls);
      console.log(JSON.stringify(batchResult, null, 2));
      break;
      
    default:
      console.log(`
Crawl4ai CLI Tool

Commands:
  health              Check API health
  crawl <url>         Crawl a single URL
    --selector <sel>  CSS selector to extract
    --screenshot      Capture screenshot
    --magic           Enable magic mode
  batch <file>        Crawl URLs from file (one per line)

Environment:
  CRAWL4AI_URL       API endpoint (default: ${API_BASE})
  CRAWL4AI_TOKEN     Bearer token for authentication
`);
  }
}

main().catch(console.error);
