import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export interface NotionPageData {
  title: string;
  blocks: any[];
  plainBlocks: { type: string; text: string }[];
}

export async function getNotionPage(pageId: string): Promise<NotionPageData> {
  try {
    const page: any = await notion.pages.retrieve({ page_id: pageId });
    const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
    
    let title = 'KBAS';
    if (page.properties?.title?.title?.[0]?.plain_text) {
      title = page.properties.title.title[0].plain_text;
    }

    const plainBlocks = blocksResponse.results.map((b: any) => {
      const type = b.type;
      const content = b[type];
      let text = '';
      if (content?.rich_text) {
        text = content.rich_text.map((t: any) => t.plain_text).join('');
      }
      return { type, text };
    });

    return {
      title,
      blocks: blocksResponse.results,
      plainBlocks,
    };
  } catch (error) {
    console.error(`Error fetching Notion page ${pageId}:`, error);
    return {
      title: 'K Beauty Aesthetic Summit',
      blocks: [],
      plainBlocks: [],
    };
  }
}
