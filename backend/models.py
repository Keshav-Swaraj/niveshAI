import sqlite3
import json
import uuid
from datetime import datetime

DATABASE_URL = "./signals.db"


def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signals (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            company_name TEXT,
            signal_type TEXT NOT NULL,
            trigger_time TEXT NOT NULL,
            raw_data TEXT,
            enriched_data TEXT,
            ai_analysis TEXT,
            signal_strength TEXT,
            confidence_score INTEGER,
            status TEXT DEFAULT 'new'
        )
    """)
    
    # Portfolio table for demo
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolio (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            company_name TEXT,
            qty INTEGER NOT NULL,
            avg_price REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()
    print("✓ Database initialized (signals.db)")


def insert_signal(
    symbol: str,
    company_name: str,
    signal_type: str,
    trigger_time: str,
    raw_data: dict,
    enriched_data: dict = None,
    ai_analysis: dict = None,
    signal_strength: str = None,
    confidence_score: int = None,
    status: str = "new"
) -> str:
    """Insert a new signal into the DB. Returns the signal_id."""
    signal_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO signals (id, symbol, company_name, signal_type, trigger_time,
            raw_data, enriched_data, ai_analysis, signal_strength, confidence_score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        signal_id,
        symbol,
        company_name,
        signal_type,
        trigger_time,
        json.dumps(raw_data) if raw_data else None,
        json.dumps(enriched_data) if enriched_data else None,
        json.dumps(ai_analysis) if ai_analysis else None,
        signal_strength,
        confidence_score,
        status
    ))
    
    conn.commit()
    conn.close()
    return signal_id


def update_signal_analysis(signal_id: str, ai_analysis: dict, signal_strength: str, confidence_score: int):
    """Update a signal with AI analysis results."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE signals 
        SET ai_analysis = ?, signal_strength = ?, confidence_score = ?, status = 'processed'
        WHERE id = ?
    """, (json.dumps(ai_analysis), signal_strength, confidence_score, signal_id))
    
    conn.commit()
    conn.close()


def get_all_signals(limit: int = 50) -> list:
    """Get all signals sorted by confidence_score DESC."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM signals 
        ORDER BY confidence_score DESC NULLS LAST, trigger_time DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_signals_by_symbol(symbol: str) -> list:
    """Get signals for a specific stock."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM signals 
        WHERE symbol = ? AND status != 'dismissed'
        ORDER BY trigger_time DESC
    """, (symbol,))
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_pending_signals() -> list:
    """Get all signals with status='new'."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM signals WHERE status = 'new' ORDER BY trigger_time DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def dismiss_signal(signal_id: str):
    """Mark a signal as dismissed."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE signals SET status = 'dismissed' WHERE id = ?", (signal_id,))
    conn.commit()
    conn.close()


def signal_to_dict(row: dict) -> dict:
    """Convert a signal row to a clean dict with parsed JSON fields."""
    result = dict(row)
    for field in ['raw_data', 'enriched_data', 'ai_analysis']:
        if result.get(field) and isinstance(result[field], str):
            try:
                result[field] = json.loads(result[field])
            except Exception:
                pass
    return result
