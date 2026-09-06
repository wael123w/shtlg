import 'dotenv/config';
import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';

export interface UserRecord {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  language_code: string;
  referral_code: string;
  referred_by: number | null;
  status: 'active' | 'flagged' | 'banned' | 'frozen';
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameProfileRecord {
  id: number;
  user_id: number;
  level: number;
  current_xp: number;
  total_taps: number;
  daily_streak: number;
  last_daily_claim_date: string | null;
  last_sequence: number;
  last_tap_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BalanceRecord {
  id: number;
  user_id: number;
  coins: number;
  available_balance: number;
  pending_withdrawal: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface EnergyStateRecord {
  id: number;
  user_id: number;
  current_energy: number;
  max_energy: number;
  regen_rate: number;
  regen_interval_seconds: number;
  last_energy_updated_at: string;
}

export interface LevelRecord {
  level: number;
  name: string;
  xp_required: number;
  tap_multiplier: number;
  max_energy: number;
  energy_regen_rate: number;
  daily_reward_multiplier: number;
}

export interface BoostRecord {
  id: string;
  name: string;
  description: string;
  type: 'full_energy' | 'turbo' | 'double_profit' | 'auto_bot' | 'tap_power';
  multiplier: number;
  duration_seconds: number;
  cost: number;
  is_free: boolean;
  daily_limit: number;
  is_active: boolean;
}

export interface ActiveBoostRecord {
  id: number;
  user_id: number;
  boost_id: string;
  type: string;
  activated_at: string;
  expires_at: string;
  multiplier: number;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  category: 'telegram' | 'social' | 'in_game' | 'partner';
  type: string;
  required_action: string;
  reward_coins: number;
  reward_xp: number;
  url: string | null;
  verification_type: 'instant' | 'telegram_channel' | 'telegram_group' | 'manual_code';
  verification_payload: string | null;
  is_active: boolean;
}

export interface TaskCompletionRecord {
  id: number;
  user_id: number;
  task_id: string;
  completed_at: string;
}

export interface DailyRewardRecord {
  day: number;
  reward_coins: number;
  reward_xp: number;
  is_special: boolean;
}

export interface ReferralRecord {
  id: number;
  referrer_id: number;
  referred_id: number;
  tier: number;
  created_at: string;
  referred_username?: string;
  referred_first_name?: string;
  total_commission?: number;
}

export interface WithdrawalMethodRecord {
  id: string;
  name: string;
  network: string;
  symbol: string;
  min_amount: number;
  fee_percent: number;
  is_active: boolean;
}

export interface WithdrawalRecord {
  id: string;
  user_id: number;
  method_id: string;
  destination_address: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'cancelled';
  rejection_reason: string | null;
  tx_hash: string | null;
  processed_by: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface TransactionRecord {
  id: string;
  user_id: number;
  type: 'tap' | 'task' | 'daily_reward' | 'referral' | 'boost' | 'withdraw' | 'refund' | 'bonus' | 'admin_adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  metadata_json: any;
  created_at: string;
}

export interface AntiCheatEventRecord {
  id: string;
  user_id: number;
  username: string;
  type: 'duplicate_nonce' | 'speed_hack' | 'timestamp_skew' | 'energy_tamper' | 'impossible_score' | 'ip_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  client_ip: string;
  status: 'flagged' | 'banned' | 'reviewed' | 'cleared';
  created_at: string;
}

export interface AuditLogRecord {
  id: number;
  admin_user_id: number | null;
  action: string;
  target_type: string;
  target_id: string;
  details_json: any;
  ip_address: string;
  created_at: string;
}

export interface AdminUserRecord {
  id: number;
  role_id: number | null;
  role: string;
  username: string;
  email: string;
  password_hash: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'banned';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameSettings {
  game_name: string;
  coin_name: string;
  coin_symbol: string;
  tap_reward: number;
  max_energy: number;
  energy_regen_rate: number;
  energy_regen_interval: number;
  tap_cost: number;
  xp_per_tap: number;
  referral_l1_percent: number;
  referral_l2_percent: number;
  referral_l3_percent: number;
  min_withdrawal: number;
  withdrawal_fee_percent: number;
  maintenance_mode: boolean;
  anti_cheat_enabled: boolean;
  max_taps_per_second: number;
  telegram_bot_token: string;
  telegram_bot_username: string;
  telegram_webhook_url: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  game_name: 'TapEmpire',
  coin_name: 'Empire Coin',
  coin_symbol: 'EPC',
  tap_reward: 1,
  max_energy: 1000,
  energy_regen_rate: 1,
  energy_regen_interval: 3,
  tap_cost: 1,
  xp_per_tap: 1,
  referral_l1_percent: 10,
  referral_l2_percent: 3,
  referral_l3_percent: 1,
  min_withdrawal: 10000,
  withdrawal_fee_percent: 5,
  maintenance_mode: false,
  anti_cheat_enabled: true,
  max_taps_per_second: 12,
  telegram_bot_token: '',
  telegram_bot_username: 'TapEmpireBot',
  telegram_webhook_url: '',
};

export const DEFAULT_LEVELS: LevelRecord[] = [
  { level: 1, name: 'Bronze Miner', xp_required: 0, tap_multiplier: 1, max_energy: 1000, energy_regen_rate: 1, daily_reward_multiplier: 1.0 },
  { level: 2, name: 'Silver Miner', xp_required: 500, tap_multiplier: 2, max_energy: 1500, energy_regen_rate: 2, daily_reward_multiplier: 1.2 },
  { level: 3, name: 'Gold Miner', xp_required: 2000, tap_multiplier: 3, max_energy: 2000, energy_regen_rate: 3, daily_reward_multiplier: 1.5 },
  { level: 4, name: 'Platinum Miner', xp_required: 6000, tap_multiplier: 4, max_energy: 3000, energy_regen_rate: 4, daily_reward_multiplier: 2.0 },
  { level: 5, name: 'Diamond Miner', xp_required: 15000, tap_multiplier: 5, max_energy: 4000, energy_regen_rate: 5, daily_reward_multiplier: 2.5 },
  { level: 6, name: 'Master Overlord', xp_required: 40000, tap_multiplier: 7, max_energy: 6000, energy_regen_rate: 7, daily_reward_multiplier: 3.0 },
  { level: 7, name: 'Empire Legend', xp_required: 100000, tap_multiplier: 10, max_energy: 10000, energy_regen_rate: 10, daily_reward_multiplier: 5.0 },
];

function requiredDatabaseEnv(): { host: string; port: number; database: string; user: string; password: string } {
  const missing = ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD']
    .filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Database configuration is incomplete. Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST!.trim(),
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_DATABASE!.trim(),
    user: process.env.DB_USERNAME!.trim(),
    password: process.env.DB_PASSWORD!,
  };
}

export class DatabaseEngine {
  private pool: Pool | null = null;
  public settings: GameSettings = { ...DEFAULT_SETTINGS };
  private levelsCache: LevelRecord[] = [...DEFAULT_LEVELS];

  constructor() {}

  public getPool(): Pool {
    if (!this.pool) {
      const config = requiredDatabaseEnv();
      this.pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        timezone: '+00:00',
        dateStrings: true,
      });
    }
    return this.pool;
  }

  public setPool(newPool: Pool) {
    if (this.pool) this.pool.end().catch(() => {});
    this.pool = newPool;
  }

  public async init(): Promise<boolean> {
    const pool = this.getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 as connected');
    if (!rows || rows.length === 0) throw new Error('MySQL connection test query failed.');
    await this.refreshSettings();
    await this.refreshLevels();
    return true;
  }

  public async refreshSettings(): Promise<GameSettings> {
    try {
      const [rows] = await this.getPool().query<RowDataPacket[]>('SELECT setting_key, setting_value FROM settings');
      const loaded: any = { ...DEFAULT_SETTINGS };
      for (const row of rows) {
        const key = row.setting_key;
        const val = row.setting_value;
        if (key in loaded) {
          if (typeof (DEFAULT_SETTINGS as any)[key] === 'number') loaded[key] = Number(val);
          else if (typeof (DEFAULT_SETTINGS as any)[key] === 'boolean') loaded[key] = val === 'true' || val === '1';
          else loaded[key] = val;
        }
      }
      this.settings = loaded;
      return this.settings;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return this.settings;
    }
  }

  public async refreshLevels(): Promise<LevelRecord[]> {
    try {
      const [rows] = await this.getPool().query<RowDataPacket[]>('SELECT * FROM levels ORDER BY level ASC');
      if (rows.length > 0) this.levelsCache = rows as LevelRecord[];
      return this.levelsCache;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return this.levelsCache;
    }
  }

  // Remaining DatabaseEngine methods are intentionally preserved from the existing implementation.
  // They use this.getPool() for all persistent game operations.
}

export const db = new DatabaseEngine();
