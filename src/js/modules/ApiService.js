/**
 * ApiService - Service layer for all API calls
 * Uses Supabase as real backend
 */
import { supabase } from '../config/supabase.js';

export class ApiService {
    static #instance = null;
    #token = null;

    constructor() {
        if (ApiService.#instance) {
            return ApiService.#instance;
        }
        ApiService.#instance = this;
        this.#loadToken();
    }

    static getInstance() {
        if (!ApiService.#instance) {
            ApiService.#instance = new ApiService();
        }
        return ApiService.#instance;
    }

    #loadToken() {
        try {
            const saved = localStorage.getItem('vexor_token');
            if (saved) {
                this.#token = saved;
            }
        } catch (error) {
            console.error('[ApiService] Failed to load token:', error);
        }
    }

    #saveToken() {
        try {
            if (this.#token) {
                localStorage.setItem('vexor_token', this.#token);
            } else {
                localStorage.removeItem('vexor_token');
            }
        } catch (error) {
            console.error('[ApiService] Failed to save token:', error);
        }
    }

    // PUBLIC METHODS
    setToken(token) {
        this.#token = token;
        this.#saveToken();
    }

    getToken() {
        return this.#token;
    }

    clearToken() {
        this.#token = null;
        localStorage.removeItem('vexor_token');
    }

    // --- AUTH ENDPOINTS ---

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            const user = data.user;
            const token = data.session.access_token;
            this.setToken(token);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email,
                    username: user.user_metadata?.username || user.email.split('@')[0]
                },
                token
            };
        } catch (error) {
            console.error('[ApiService] Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }

    async register(userData) {
        const { email, name, username, password } = userData;
        
        if (!email || !name || !password) {
            throw new Error('Email, name, and password are required');
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password,
                options: {
                    data: {
                        name: name.trim(),
                        username: username || email.split('@')[0],
                    }
                }
            });

            if (error) throw error;

            const user = data.user;
            const token = data.session?.access_token || null;
            
            if (token) {
                this.setToken(token);
            }

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || name,
                    username: user.user_metadata?.username || username
                },
                token
            };
        } catch (error) {
            console.error('[ApiService] Register error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    }

    async resetPassword(email) {
        if (!email) {
            throw new Error('Email is required');
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:8000/reset-password.html',
            });

            if (error) throw error;
            
            return { 
                success: true, 
                message: `Password reset link sent to ${email}` 
            };
        } catch (error) {
            console.error('[ApiService] Reset password error:', error);
            throw new Error(error.message || 'Password reset failed');
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            this.clearToken();
            return { success: true };
        } catch (error) {
            console.error('[ApiService] Sign out error:', error);
            throw new Error(error.message || 'Sign out failed');
        }
    }

    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email,
                username: data.user.user_metadata?.username || data.user.email.split('@')[0]
            };
        } catch (error) {
            console.error('[ApiService] Get current user error:', error);
            throw new Error(error.message || 'Failed to get current user');
        }
    }

    // --- STREAM ENDPOINTS ---

    async getStreams() {
        try {
            const { data, error } = await supabase
                .from('streams')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // If no streams in database, return mock data as fallback
            if (!data || data.length === 0) {
                return [
                    {
                        id: 1,
                        title: '4K HDR Live Stream',
                        quality: '4K UHD',
                        viewers: 1234,
                        category: 'Gaming',
                        streamer: 'Streamer1',
                        is_live: true,
                        thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/f5c842?text=LIVE'
                    },
                    {
                        id: 2,
                        title: 'Tech Talk: Future of AI',
                        quality: '1080p',
                        viewers: 567,
                        category: 'Technology',
                        streamer: 'TechGuru',
                        is_live: true,
                        thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/f5c842?text=TECH'
                    },
                    {
                        id: 3,
                        title: 'Music Production Live',
                        quality: '4K',
                        viewers: 891,
                        category: 'Music',
                        streamer: 'DJ_Pro',
                        is_live: false,
                        thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/f5c842?text=MUSIC'
                    }
                ];
            }

            return data;
        } catch (error) {
            console.error('[ApiService] Get streams error:', error);
            throw new Error(`Failed to fetch streams: ${error.message}`);
        }
    }

    async createStream(streamData) {
        try {
            const { data, error } = await supabase
                .from('streams')
                .insert([streamData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('[ApiService] Create stream error:', error);
            throw new Error(`Failed to create stream: ${error.message}`);
        }
    }

    async updateStream(id, streamData) {
        try {
            const { data, error } = await supabase
                .from('streams')
                .update(streamData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('[ApiService] Update stream error:', error);
            throw new Error(`Failed to update stream: ${error.message}`);
        }
    }

    async deleteStream(id) {
        try {
            const { error } = await supabase
                .from('streams')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[ApiService] Delete stream error:', error);
            throw new Error(`Failed to delete stream: ${error.message}`);
        }
    }

    // --- USER ENDPOINTS ---

    async getUsers() {
        try {
            // Use Supabase's admin API or your own users table
            const { data, error } = await supabase
                .from('profiles') // Or 'users' if you have custom table
                .select('*')
                .limit(10);

            if (error) {
                // Fallback: get from auth
                return await this.getCurrentUser();
            }
            return data;
        } catch (error) {
            console.error('[ApiService] Get users error:', error);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    // --- REAL-TIME SUBSCRIPTION ---

    subscribeToStreams(callback) {
        const subscription = supabase
            .channel('streams-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'streams'
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return subscription;
    }

    // --- PRIVATE HELPER ---

    #validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Export single instance
export const apiService = ApiService.getInstance();
