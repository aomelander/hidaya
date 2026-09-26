import { createClient } from '@supabase/supabase-js';
import { SEED_FIXTURES } from './seedFixtures';

// Default to mock URLs if env is not provided during build
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback logic enabled if the URL is the mock one
const useMock = supabaseUrl === 'https://mock.supabase.co';

export class RetrievalService {
  /**
   * Stage 1: Query ayah_topic and topic tables directly for hard matches.
   */
  static async findDirectMatches(emotionId?: string, domainId?: string) {
    if (useMock) {
      return SEED_FIXTURES.filter(f => 
        (emotionId && f.topic.slug.includes(emotionId.toLowerCase())) || 
        (domainId && f.topic.life_domain === domainId)
      );
    }
    
    let query = supabase.from('ayah_topic').select('ayah_id, topic!inner(*)');
    if (emotionId) query = query.eq('topic.slug', emotionId);
    if (domainId) query = query.eq('topic.life_domain', domainId);
    
    const { data, error } = await query.limit(5);
    if (error) throw error;
    
    return data;
  }

  /**
   * Stage 3: Execute semantic search or fall back to fixture keywords.
   */
  static async findVectorMatches(queryText: string) {
    if (useMock) {
      const normalized = queryText.toLowerCase();
      return SEED_FIXTURES.filter(f => 
        f.topic.title.toLowerCase().includes(normalized) || 
        f.topic.slug.includes(normalized) ||
        f.translations.some(t => t.text.toLowerCase().includes(normalized))
      ).slice(0, 3);
    }
    
    // In a real app we'd convert queryText to an embedding first using an embedding model
    const mockEmbedding = Array(1536).fill(0.1); 
    
    const { data, error } = await supabase.rpc('match_verses', {
      query_embedding: mockEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Stage 2: Read from cached_reflection.
   */
  static async getCachedReflection(queryHash: string) {
    if (useMock) return null;
    
    const { data, error } = await supabase
      .from('cached_reflection')
      .select('response_json')
      .eq('query_hash', queryHash)
      .maybeSingle();
      
    if (error) throw error;
    return data?.response_json || null;
  }

  /**
   * Stage 4: Write to cached_reflection.
   */
  static async setCachedReflection(queryHash: string, responseData: any) {
    if (useMock) return;
    
    const { error } = await supabase
      .from('cached_reflection')
      .insert({ query_hash: queryHash, response_json: responseData });
      
    if (error) {
      console.error('Failed to cache reflection', error);
    }
  }
}
