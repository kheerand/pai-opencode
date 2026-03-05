#!/usr/bin/env bun
/**
 * Fix All Tag Colors
 */

import { PaperlessClient } from '../src/PaperlessClient.js';

const COLORS = {
  FOLDER_RETENTION: '#B2654D',
  LIFECYCLE: '#8C7760',
  RELATED_TO: '#608080',
} as const;

interface TagFix {
  tag: any;
  expectedColor: string;
}

function getExpectedColor(tag: any): string {
  const name = tag.name;

  const lifecycleTags = ['Action', 'Archive', 'Delete', 'Expired', 'Inbox', 'Record'];
  if (lifecycleTags.includes(name)) {
    return COLORS.LIFECYCLE;
  }

  if (name.startsWith('F ') || name.startsWith('R ')) {
    return COLORS.FOLDER_RETENTION;
  }

  return COLORS.RELATED_TO;
}

async function main() {
  console.log('Tag Color Fixer for Document Repository');
  console.log('');

  const baseUrl = process.env.PAPERLESS_BASE_URL;
  const token = process.env.PAPERLESS_TOKEN;

  if (!baseUrl || !token) {
    console.error('Missing required environment variables:');
    console.error('  PAPERLESS_BASE_URL    - Document repository URL');
    console.error('  PAPERLESS_TOKEN       - Authentication token');
    console.error('');
    console.error('Get token from:');
    console.error('  1. Web UI: https://paperless.s.cytrax.com.au');
    console.error('  2. Or CLI: bun run ../src/cli.ts login username password');
    console.error('');
    console.error('Set environment variables:');
    console.error('  export PAPERLESS_BASE_URL=https://paperless.s.cytrax.com.au');
    console.error(`  export PAPERLESS_TOKEN=<your-token>`);
    process.exit(1);
  }

  const client = new PaperlessClient({ baseUrl, token });

  console.log('Fetching all tags...\n');

  try {
    const response = await client.listTags();

    console.log(`Total tags: ${response.count}\n`);

    const fixes: TagFix[] = [];
    const folderTagIds: number[] = [];
    const lifecycleTagIds: number[] = [];
    const relatedTagIds: number[] = [];

    response.results.forEach(tag => {
      const expectedColor = getExpectedColor(tag);
      const currentColor = tag.color;

      if (currentColor.toLowerCase() !== expectedColor.toLowerCase()) {
        fixes.push({
          tag,
          expectedColor,
          currentColor,
        });

        if (tag.name.startsWith('F ')) folderTagIds.push(tag.id);
        if (['Action', 'Archive', 'Record', 'Delete', 'Expired', 'Inbox', 'Record'].includes(tag.name)) {
          lifecycleTagIds.push(tag.id);
        } else {
          relatedTagIds.push(tag.id);
        }
      }
    });

    console.log(`Tags needing fixes: ${fixes.length}\n`);

    const folderFixes = fixes.filter(f => f.tag.name.startsWith('F '));
    const lifecycleFixes = fixes.filter(f =>
      ['Action', 'Archive', 'Delete', 'Expired', 'Inbox', 'Record'].includes(f.tag.name)
    );
    const relatedFixes = fixes.filter(f => !folderFixes.includes(f) && !lifecycleFixes.includes(f));

    console.log(`Fixing ${folderFixes.length} folder tags to ${COLORS.FOLDER_RETENTION}...`);

    for (const fix of folderFixes) {
      await client.updateTagColor(fix.tag.id, COLORS.FOLDER_RETENTION);
      console.log(`  Fixed: ${fix.tag.name} (${fix.currentColor} -> ${COLORS.FOLDER_RETENTION})`);
    }

    console.log(`Fixing ${lifecycleFixes.length} lifecycle tags to ${COLORS.LIFECYCLE}...`);

    for (const fix of lifecycleFixes) {
      await client.updateTagColor(fix.tag.id, COLORS.LIFECYCLE);
      console.log(`  Fixed: ${fix.tag.name} (${fix.currentColor} -> ${COLORS.LIFECYCLE})`);
    }

    console.log(`Fixing ${relatedFixes.length} related-to tags to ${COLORS.RELATED_TO}...`);

    for (const fix of relatedFixes) {
      await client.updateTagColor(fix.tag.id, COLORS.RELATED_TO);
      console.log(`  Fixed: ${fix.tag.name} (${fix.currentColor} -> ${COLORS.RELATED_TO})`);
    }

    console.log('');
    console.log('Success! All tag colors updated.');
    console.log('');
    console.log('Summary:');
    console.log(`  Folder tags fixed: ${folderFixes.length}`);
    console.log(`  Lifecycle tags fixed: ${lifecycleFixes.length}`);
    console.log(`  Related-to tags fixed: ${relatedFixes.length}`);
    console.log(`  Total tags updated: ${fixes.length}`);
    console.log('');
    console.log('Refresh your Document repository web interface to see updated colors!');

  } catch (error: any) {
    console.error('Error fixing tag colors:');
    if (error instanceof Error) {
      console.error(`  Message: ${error.message}`);
    } else {
      console.error(`  Details: ${JSON.stringify(error)}`);
    }
    process.exit(1);
  }
}

main();
