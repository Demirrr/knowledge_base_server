/**
 * Path utilities for the Knowledge Base Server
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Get the directory name from import.meta.url
 */
export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * Default path for the knowledge base file
 */
export function getDefaultMemoryPath(importMetaUrl: string): string {
  return path.join(getDirname(importMetaUrl), 'knowledge_base.jsonl');
}

/**
 * Resolve the memory file path from environment variable or default
 */
export async function resolveMemoryFilePath(importMetaUrl: string): Promise<string> {
  if (process.env.KNOWLEDGE_BASE_FILE_PATH) {
    return path.isAbsolute(process.env.KNOWLEDGE_BASE_FILE_PATH)
      ? process.env.KNOWLEDGE_BASE_FILE_PATH
      : path.join(getDirname(importMetaUrl), process.env.KNOWLEDGE_BASE_FILE_PATH);
  }
  
  return getDefaultMemoryPath(importMetaUrl);
}
