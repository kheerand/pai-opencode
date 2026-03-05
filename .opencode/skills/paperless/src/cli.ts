#!/usr/bin/env bun
/**
 * Paperless-ngx CLI
 *
 * Command-line interface for Paperless-ngx API client
 */

import { PaperlessClient } from './src/PaperlessClient';
import { readFileSync } from 'fs';

// ============================================================================
// Configuration
// ============================================================================

interface Config {
  baseUrl: string;
  token?: string;
  username?: string;
  password?: string;
}

function loadConfig(): Config {
  // Check environment variables first
  const envConfig: Config = {
    baseUrl: process.env.PAPERLESS_BASE_URL || 'http://localhost:8000',
    token: process.env.PAPERLESS_TOKEN,
    username: process.env.PAPERLESS_USERNAME,
    password: process.env.PAPERLESS_PASSWORD,
  };

  // Check for config file
  try {
    const configFile = process.env.PAPERLESS_CONFIG || '/tmp/paperless-config.json';
    if (require('fs').existsSync(configFile)) {
      const fileConfig = JSON.parse(readFileSync(configFile, 'utf-8'));
      return { ...envConfig, ...fileConfig };
    }
  } catch {
    // Config file doesn't exist, use env vars
  }

  return envConfig;
}

function createClient(config: Config): PaperlessClient {
  return new PaperlessClient({
    baseUrl: config.baseUrl,
    token: config.token,
  });
}

// ============================================================================
// Commands
// ============================================================================

async function cmdList(args: string[]) {
  const config = loadConfig();
  const client = createClient(config);

  const page = args.length > 0 ? parseInt(args[0]) : 1;
  const pageSize = args.length > 1 ? parseInt(args[1]) : 100;

  console.log(`Listing documents (page ${page}, ${pageSize} per page)...\n`);

  const response = await client.listDocuments({ page, page_size: pageSize });

  console.log(`Total documents: ${response.count}`);
  console.log(`Showing page ${page} of ${Math.ceil(response.count / pageSize)}\n`);

  response.results.forEach(doc => {
    console.log(`  [${doc.id}] ${doc.title}`);
    if (doc.correspondent) console.log(`      Correspondent: ${doc.correspondent}`);
    if (doc.document_type) console.log(`      Type: ${doc.document_type}`);
    if (doc.tags && doc.tags.length > 0) console.log(`      Tags: ${doc.tags.join(', ')}`);
  });

  if (response.next) {
    console.log(`\nNext page: ${args.length > 0 ? parseInt(args[0]) + 1 : 2}`);
  }
}

async function cmdSearch(args: string[]) {
  if (args.length === 0) {
    console.error('Error: Search query required');
    console.error('Usage: paperless search <query>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);
  const query = args.join(' ');

  console.log(`Searching for: ${query}\n`);

  const response = await client.searchDocuments(query);

  console.log(`Found ${response.count} documents\n`);

  response.results.forEach((doc, index) => {
    console.log(`${index + 1}. [${doc.id}] ${doc.title}`);
    if (doc.__search_hit__?.score) {
      console.log(`   Score: ${doc.__search_hit__.score.toFixed(3)}`);
    }
    if (doc.__search_hit__?.highlights) {
      console.log(`   Match: ${doc.__search_hit__.highlights.replace(/<[^>]+>/g, ' ')}`);
    }
  });
}

async function cmdGet(args: string[]) {
  if (args.length === 0) {
    console.error('Error: Document ID required');
    console.error('Usage: paperless get <document-id>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);
  const id = parseInt(args[0]);

  console.log(`Fetching document ${id}...\n`);

  const doc = await client.getDocument(id);

  console.log(`Title: ${doc.title}`);
  console.log(`ID: ${doc.id}`);
  console.log(`Created: ${doc.created || doc.created_date}`);
  console.log(`Correspondent: ${doc.correspondent || 'None'}`);
  console.log(`Document Type: ${doc.document_type || 'None'}`);
  console.log(`Tags: ${doc.tags?.join(', ') || 'None'}`);
  console.log(`Content: ${doc.content?.substring(0, 200)}...\n`);
}

async function cmdUpload(args: string[]) {
  if (args.length === 0) {
    console.error('Error: File path required');
    console.error('Usage: paperless upload <file-path> [options]');
    console.error('Options:');
    console.error('  --title <title>');
    console.error('  --correspondent <id>');
    console.error('  --document-type <id>');
    console.error('  --tags <tag-ids>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);

  const filePath = args[0];
  const title = getArgValue(args, '--title');
  const correspondent = getArgValue(args, '--correspondent');
  const documentType = getArgValue(args, '--document-type');
  const tags = getArgValue(args, '--tags');

  console.log(`Uploading: ${filePath}\n`);

  try {
    const file = require('fs').readFileSync(filePath);
    const blob = new Blob([file], { type: 'application/octet-stream' });

    const metadata: any = {};
    if (title) metadata.title = title;
    if (correspondent) metadata.correspondent = parseInt(correspondent);
    if (documentType) metadata.document_type = parseInt(documentType);
    if (tags) metadata.tags = tags.split(',').map(t => parseInt(t.trim()));

    const response = await client.uploadDocument(blob, metadata);

    console.log(`✓ Upload started!`);
    console.log(`  Task ID: ${response.task_id}`);
    console.log(`  Document will be processed asynchronously...`);
  } catch (error: any) {
    console.error(`✗ Upload failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdBulkEdit(args: string[]) {
  if (args.length === 0) {
    console.error('Error: Operation and document IDs required');
    console.error('Usage: paperless bulk <operation> <doc-ids> [options]');
    console.error('Operations:');
    console.error('  add-tag <tag-id>');
    console.error('  remove-tag <tag-id>');
    console.error('  modify-tags <add-ids> <remove-ids>');
    console.error('  set-correspondent <id>');
    console.error('  set-document-type <id>');
    console.error('  delete');
    console.error('  reprocess');
    console.error('  set-permissions <owner-id>');
    console.error('  merge <metadata-doc-id>');
    console.error('  split <pages>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);

  const operation = args[0];
  const docIds = args.slice(1).map(id => parseInt(id));

  const parameters: any = {};
  const options: any = {};

  // Parse parameters
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parameters[key] = value;
        i++; // Skip next arg as it's a value
      }
    }
  }

  console.log(`Bulk operation: ${operation}`);
  console.log(`Document IDs: ${docIds.join(', ')}\n`);

  try {
    await client.bulkEditDocuments({
      documents: docIds,
      method: operation,
      parameters,
      options,
    });

    console.log('✓ Bulk operation submitted!');
    console.log('  Check Document repository for results');
  } catch (error: any) {
    console.error(`✗ Bulk operation failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdDownload(args: string[]) {
  if (args.length === 0) {
    console.error('Error: Document ID required');
    console.error('Usage: paperless download <document-id> [--original]');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);
  const id = parseInt(args[0]);
  const original = args.includes('--original');

  console.log(`Downloading document ${id}...\n`);

  try {
    const blob = await client.downloadDocument(id, original);

    const filename = `document_${id}${original ? '_original' : ''}.pdf`;
    require('fs').writeFileSync(filename, Buffer.from(await blob.arrayBuffer()));

    console.log(`✓ Downloaded to: ${filename}`);
  } catch (error: any) {
    console.error(`✗ Download failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdTags(args: string[]) {
  const config = loadConfig();
  const client = createClient(config);

  console.log('Listing tags...\n');

  const response = await client.listTags();

  console.log(`Total tags: ${response.count}\n`);

  response.results.forEach(tag => {
    const colorBox = `\x1b[38;5;${tag.color}m\x1b[0m`;
    console.log(`${colorBox} [${tag.id}] ${tag.name}\x1b[0m`);
    console.log(`      Slug: ${tag.slug}`);
    console.log(`      Documents: ${tag.document_count}`);
    if (tag.match) console.log(`      Match: ${tag.match}`);
  });
}

async function cmdCreateTag(args: string[]) {
  if (args.length === 0) {
    console.error('Error: Tag name required');
    console.error('Usage: paperless create-tag <tag-name> [--color <hex-color>]');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);

  const name = args[0];
  const color = getArgValue(args, '--color');

  console.log(`Creating tag: ${name}\n`);

  try {
    const tag = await client.createTag({
      name,
      color: color || '#B2654D',
      matching_algorithm: 6, // Auto
      is_insensitive: true,
    });

    console.log('✓ Tag created successfully!');
    console.log(`  ID: ${tag.id}`);
    console.log(`  Slug: ${tag.slug}`);
    console.log(`  Color: ${tag.color}`);
  } catch (error: any) {
    console.error(`✗ Tag creation failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdUpdateTagColor(args: string[]) {
  if (args.length < 2) {
    console.error('Error: Tag ID and color required');
    console.error('Usage: paperless update-tag-color <tag-id> <hex-color>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);

  const id = parseInt(args[0]);
  const color = args[1];

  console.log(`Updating tag ${id} color to ${color}...\n`);

  try {
    const tag = await client.updateTagColor(id, color);
    console.log('✓ Tag color updated successfully!');
    console.log(`  ID: ${tag.id}`);
    console.log(`  Name: ${tag.name}`);
    console.log(`  New Color: ${tag.color}`);
  } catch (error: any) {
    console.error(`✗ Tag update failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdLogin(args: string[]) {
  if (args.length < 2) {
    console.error('Error: Username and password required');
    console.error('Usage: paperless login <username> <password>');
    process.exit(1);
  }

  const config = loadConfig();
  const client = createClient(config);

  const username = args[0];
  const password = args[1];

  console.log(`Authenticating as ${username}...\n`);

  try {
    const response = await client.createToken(username, password);
    console.log('✓ Authentication successful!');
    console.log(`  Token: ${response.token}\n`);
    console.log('Set this token as PAPERLESS_TOKEN environment variable:');
    console.log(`export PAPERLESS_TOKEN=${response.token}`);
  } catch (error: any) {
    console.error(`✗ Authentication failed: ${error.message}`);
    process.exit(1);
  }
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    const value = args[index + 1];
    if (!value.startsWith('--')) {
      return value;
    }
  }
  return undefined;
}

// ============================================================================
// Main
// ============================================================================

const commands: Record<string, (args: string[]) => Promise<void>> = {
  'list': cmdList,
  'search': cmdSearch,
  'get': cmdGet,
  'upload': cmdUpload,
  'bulk': cmdBulkEdit,
  'download': cmdDownload,
  'tags': cmdTags,
  'create-tag': cmdCreateTag,
  'update-tag-color': cmdUpdateTagColor,
  'login': cmdLogin,
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Paperless-ngx CLI');
    console.log('');
    console.log('Usage: paperless <command> [arguments]');
    console.log('');
    console.log('Commands:');
    console.log('  list              List all documents');
    console.log('  search <query>    Search documents');
    console.log('  get <id>          Get document details');
    console.log('  upload <file>      Upload a document');
    console.log('  bulk <op> <ids>  Bulk edit documents');
    console.log('  download <id>     Download document');
    console.log('  tags              List all tags');
    console.log('  create-tag <name>  Create a tag');
    console.log('  update-tag-color <id> <color>  Update tag color');
    console.log('  login <user> <pass>  Authenticate and get token');
    console.log('');
    console.log('Environment Variables:');
    console.log('  PAPERLESS_BASE_URL    Document repository URL (default: http://localhost:8000)');
    console.log('  PAPERLESS_TOKEN       Authentication token');
    console.log('  PAPERLESS_USERNAME    Username for login');
    console.log('  PAPERLESS_PASSWORD    Password for login');
    console.log('  PAPERLESS_CONFIG     Config file path');
    process.exit(0);
  }

  const command = args[0];

  if (commands[command]) {
    await commands[command](args.slice(1));
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Run "paperless" for usage information');
    process.exit(1);
  }
}

main().catch((error: any) => {
  console.error('Error:', error.message);
  process.exit(1);
});
