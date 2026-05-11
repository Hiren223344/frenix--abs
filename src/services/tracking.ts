import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

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
    await databases.createDocument(
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
    );
  } catch (error) {
    console.error('Failed to log request to Appwrite:', error);
  }
};

export const validateApiKey = async (key: string) => {
  // Enforce key prefix
  if (!key.startsWith('sk-utm-')) {
    return null;
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      [Query.equal('key', key)]
    );
    
    if (response.documents.length > 0) {
      const doc = response.documents[0];
      
      // Check for expiry
      if (doc.expiresAt) {
        const expiryDate = new Date(doc.expiresAt);
        if (new Date() > expiryDate) {
          console.warn(`API key ${key} has expired.`);
          return null;
        }
      }
      
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
    const response = await databases.createDocument(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        key,
        name,
        expiresAt,
        createdAt: new Date().toISOString()
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to generate API key:', error);
    throw error;
  }
};

export const deleteApiKey = async (docId: string) => {
  try {
    await databases.deleteDocument(DATABASE_ID, API_KEYS_COLLECTION_ID, docId);
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw error;
  }
};

export const getApiKeys = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return [];
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REQUESTS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Failed to fetch stats from Appwrite:', error);
    return [];
  }
};

export const getUserCredits = async (userId: string): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (response.documents.length > 0) {
      return response.documents[0].credits;
    }
    
    // Initialize user with $5.00 if not found
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        credits: 5.0
      }
    );
    return 5.0;
  } catch (error) {
    console.error('Failed to get user credits:', error);
    return 0;
  }
};

export const deductCredits = async (userId: string, amount: number) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (response.documents.length > 0) {
      const doc = response.documents[0];
      const newBalance = Math.max(0, doc.credits - amount);
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        doc.$id,
        { credits: newBalance }
      );
    }
  } catch (error) {
    console.error('Failed to deduct credits:', error);
  }
};
