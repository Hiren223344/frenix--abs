import { databasesAdmin } from '@/lib/appwrite-admin';
import { ID, Query } from 'node-appwrite';

// Retry utility for network flakiness
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('fetch failed'))) {
      console.warn(`Database call failed, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const REQUESTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REQUESTS_COLLECTION_ID || 'requests';
const API_KEYS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID || 'apiKeys';
const USERS_COLLECTION_ID = 'users';

export interface LogRequestParams {
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  status: 'success' | 'failed';
}

export const logRequest = async (params: LogRequestParams) => {
  try {
    await withRetry(() => databasesAdmin.createDocument(
      DATABASE_ID,
      REQUESTS_COLLECTION_ID,
      ID.unique(),
      {
        userId: params.userId,
        model: params.model,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.promptTokens + params.completionTokens,
        status: params.status,
        timestamp: new Date().toISOString(),
      }
    ));
  } catch (error) {
    console.error('Failed to log request to Appwrite:', error);
  }
};

export const validateApiKey = async (key: string) => {
  if (!key.startsWith('sk-utm-')) return null;

  try {
    const response = await withRetry(() => databasesAdmin.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      [Query.equal('key', key)]
    ));
    
    if (response.documents.length > 0) {
      const doc = response.documents[0];
      if (doc.expiresAt && new Date() > new Date(doc.expiresAt)) return null;
      return doc.userId;
    }
    return null;
  } catch (error) {
    console.error('Failed to validate API key from Appwrite:', error);
    return null;
  }
};

export const generateApiKey = async (userId: string, name: string = 'Default Key', expiresAt: string | null = null) => {
  const key = `sk-utm-${ID.unique()}${Math.random().toString(36).substring(2, 10)}`;
  try {
    return await withRetry(() => databasesAdmin.createDocument(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      ID.unique(),
      { userId, key, name, expiresAt, createdAt: new Date().toISOString() }
    ));
  } catch (error) {
    console.error('Failed to generate API key:', error);
    throw error;
  }
};

export const deleteApiKey = async (docId: string) => {
  try {
    await withRetry(() => databasesAdmin.deleteDocument(DATABASE_ID, API_KEYS_COLLECTION_ID, docId));
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw error;
  }
};

export const getApiKeys = async (userId: string) => {
  try {
    const response = await withRetry(() => databasesAdmin.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    ));
    return response.documents;
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return [];
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const response = await withRetry(() => databasesAdmin.listDocuments(
      DATABASE_ID,
      REQUESTS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    ));
    return response.documents;
  } catch (error) {
    console.error('Failed to fetch stats from Appwrite:', error);
    return [];
  }
};

export const getUserCredits = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  try {
    const response = await withRetry(() => databasesAdmin.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    ));
    
    if (response.documents.length > 0) {
      return response.documents[0].credits;
    }
    
    // Initialize user with $5.00 if not found
    console.log(`Initializing new user record for: ${userId}`);
    const newDoc = await withRetry(() => databasesAdmin.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      { userId, credits: 5.0 }
    ));
    return newDoc.credits;
  } catch (error) {
    console.error(`Failed to get credits for user ${userId}:`, error);
    return 0;
  }
};

export const deductCredits = async (userId: string, amount: number) => {
  if (!userId || amount <= 0) return;
  try {
    const response = await withRetry(() => databasesAdmin.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    ));
    
    if (response.documents.length > 0) {
      const doc = response.documents[0];
      const newBalance = Math.max(0, doc.credits - amount);
      await withRetry(() => databasesAdmin.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        doc.$id,
        { credits: newBalance }
      ));
      console.log(`Deducted ${amount} from ${userId}. New balance: ${newBalance}`);
    }
  } catch (error) {
    console.error('Failed to deduct credits:', error);
  }
};
